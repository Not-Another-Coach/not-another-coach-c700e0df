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
        client:profiles!client_id(id, first_name, last_name),
        trainer:profiles!trainer_id(id, first_name, last_name)
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

    // Get client and trainer emails from auth.users
    const { data: clientAuth } = await supabase.auth.admin.getUserById(discoveryCall.client_id)
    const { data: trainerAuth } = await supabase.auth.admin.getUserById(discoveryCall.trainer_id)

    // Get trainer settings separately
    const { data: trainerSettings } = await supabase
      .from('trainer_availability_settings')
      .select('prep_notes')
      .eq('trainer_id', discoveryCall.trainer_id)
      .single()

    const client = discoveryCall.client as any
    const trainer = discoveryCall.trainer as any
    
    const clientEmail = clientAuth?.user?.email
    const trainerEmail = trainerAuth?.user?.email

    if (!clientEmail || !trainerEmail) {
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
        recipientEmail = clientEmail
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
        recipientEmail = clientEmail
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
        recipientEmail = trainerEmail
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

    // Create in-app alert for trainer notifications
    if (type === 'trainer_notification' && notificationType === 'new_booking') {
      try {
        const alertTitle = notificationType === 'new_booking' 
          ? 'New Discovery Call Booked!'
          : 'Discovery Call Update'
        
        const alertContent = notificationType === 'new_booking'
          ? `${clientName} has booked a discovery call with you for ${scheduledDate} at ${scheduledTime}.`
          : `${clientName} has updated their discovery call.`

        await supabase
          .from('alerts')
          .insert({
            alert_type: 'discovery_call_booked',
            title: alertTitle,
            content: alertContent,
            target_audience: { trainers: [discoveryCall.trainer_id] },
            metadata: {
              discovery_call_id: discoveryCallId,
              client_id: discoveryCall.client_id,
              trainer_id: discoveryCall.trainer_id,
              scheduled_for: discoveryCall.scheduled_for,
              client_name: clientName
            },
            is_active: true,
            priority: 2
          })

        console.log('Alert created for trainer:', discoveryCall.trainer_id)
      } catch (alertError) {
        console.error('Error creating alert:', alertError)
        // Don't fail the whole request if alert creation fails
      }
    }

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