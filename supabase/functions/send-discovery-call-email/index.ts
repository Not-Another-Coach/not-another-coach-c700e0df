import React from 'npm:react@18.3.1'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'
import { DiscoveryCallConfirmation } from './_templates/confirmation.tsx'
import { DiscoveryCallReminder } from './_templates/reminder.tsx'
import { TrainerNotification } from './_templates/trainer-notification.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  type: 'confirmation' | 'reminder' | 'trainer_notification'
  discoveryCallId: string
  timeUntil?: string // For reminders, e.g., "in 24 hours", "in 1 hour"
  notificationType?: 'new_booking' | 'cancellation' | 'reschedule' // For trainer notifications
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { type, discoveryCallId, timeUntil, notificationType }: EmailRequest = await req.json()

    console.log(`Processing ${type} email for discovery call ${discoveryCallId}`)

    // Fetch discovery call details with related data
    const { data: discoveryCall, error: callError } = await supabase
      .from('discovery_calls')
      .select(`
        *,
        client:client_id(id, first_name, last_name, email),
        trainer:trainer_id(id, first_name, last_name, email),
        trainer_settings:trainer_availability_settings!trainer_id(prep_notes)
      `)
      .eq('id', discoveryCallId)
      .single()

    if (callError || !discoveryCall) {
      console.error('Error fetching discovery call:', callError)
      return new Response(
        JSON.stringify({ error: 'Discovery call not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const client = discoveryCall.client as any
    const trainer = discoveryCall.trainer as any
    const trainerSettings = discoveryCall.trainer_settings?.[0] as any

    if (!client?.email || !trainer?.email) {
      console.error('Missing email addresses for client or trainer')
      return new Response(
        JSON.stringify({ error: 'Missing email addresses' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const scheduledDate = new Date(discoveryCall.scheduled_for).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const scheduledTime = new Date(discoveryCall.scheduled_for).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })

    const clientName = `${client.first_name} ${client.last_name}`
    const trainerName = `${trainer.first_name} ${trainer.last_name}`
    const appUrl = supabaseUrl.replace('.supabase.co', '.lovable.app') || 'https://your-app.com'

    let emailHtml: string
    let subject: string
    let recipientEmail: string

    switch (type) {
      case 'confirmation':
        emailHtml = await renderAsync(
          React.createElement(DiscoveryCallConfirmation, {
            clientName,
            trainerName,
            scheduledDate,
            scheduledTime,
            duration: discoveryCall.duration_minutes,
            prepNotes: trainerSettings?.prep_notes,
            bookingNotes: discoveryCall.booking_notes,
            appUrl
          })
        )
        subject = `Discovery call confirmed with ${trainerName}`
        recipientEmail = client.email
        break

      case 'reminder':
        emailHtml = await renderAsync(
          React.createElement(DiscoveryCallReminder, {
            clientName,
            trainerName,
            scheduledDate,
            scheduledTime,
            duration: discoveryCall.duration_minutes,
            timeUntil: timeUntil || 'soon',
            prepNotes: trainerSettings?.prep_notes,
            appUrl
          })
        )
        subject = `Reminder: Discovery call with ${trainerName} ${timeUntil || 'coming up'}`
        recipientEmail = client.email
        break

      case 'trainer_notification':
        emailHtml = await renderAsync(
          React.createElement(TrainerNotification, {
            trainerName,
            clientName,
            scheduledDate,
            scheduledTime,
            duration: discoveryCall.duration_minutes,
            bookingNotes: discoveryCall.booking_notes,
            notificationType: notificationType || 'new_booking',
            appUrl
          })
        )
        subject = notificationType === 'new_booking' 
          ? `New discovery call booked with ${clientName}`
          : notificationType === 'cancellation'
          ? `Discovery call cancelled by ${clientName}`
          : `Discovery call rescheduled by ${clientName}`
        recipientEmail = trainer.email
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid email type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    // Send email using Resend
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: 'FitMatch <noreply@fitmatch.app>',
      to: [recipientEmail],
      subject,
      html: emailHtml,
    })

    if (emailError) {
      console.error('Error sending email:', emailError)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: emailError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Email sent successfully: ${emailResult?.id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResult?.id,
        type,
        recipient: recipientEmail 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-discovery-call-email function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})