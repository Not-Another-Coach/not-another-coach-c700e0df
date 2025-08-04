import React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
} from 'npm:@react-email/components@0.0.22'

interface TrainerNotificationProps {
  trainerName: string
  clientName: string
  scheduledDate: string
  scheduledTime: string
  duration: number
  bookingNotes?: string
  notificationType: 'new_booking' | 'cancellation' | 'reschedule'
  appUrl: string
}

export const TrainerNotification = ({
  trainerName,
  clientName,
  scheduledDate,
  scheduledTime,
  duration,
  bookingNotes,
  notificationType,
  appUrl
}: TrainerNotificationProps) => {
  const getSubject = () => {
    switch (notificationType) {
      case 'new_booking':
        return `New discovery call booked with ${clientName}`
      case 'cancellation':
        return `Discovery call cancelled by ${clientName}`
      case 'reschedule':
        return `Discovery call rescheduled by ${clientName}`
      default:
        return `Discovery call update from ${clientName}`
    }
  }

  const getHeading = () => {
    switch (notificationType) {
      case 'new_booking':
        return 'New Discovery Call Booked! 📅'
      case 'cancellation':
        return 'Discovery Call Cancelled ❌'
      case 'reschedule':
        return 'Discovery Call Rescheduled 🔄'
      default:
        return 'Discovery Call Update'
    }
  }

  const getMessage = () => {
    switch (notificationType) {
      case 'new_booking':
        return `Great news! ${clientName} has booked a discovery call with you.`
      case 'cancellation':
        return `${clientName} has cancelled their discovery call with you.`
      case 'reschedule':
        return `${clientName} has rescheduled their discovery call with you.`
      default:
        return `${clientName} has updated their discovery call with you.`
    }
  }

  return (
    <Html>
      <Head />
      <Preview>{getSubject()}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{getHeading()}</Heading>
          
          <Text style={text}>
            Hi {trainerName},
          </Text>
          
          <Text style={text}>
            {getMessage()}
          </Text>

          {notificationType !== 'cancellation' && (
            <Section style={callDetailsBox}>
              <Heading style={h2}>Call Details</Heading>
              <Text style={detailText}>
                <strong>Client:</strong> {clientName}<br/>
                <strong>Date:</strong> {scheduledDate}<br/>
                <strong>Time:</strong> {scheduledTime}<br/>
                <strong>Duration:</strong> {duration} minutes
              </Text>
            </Section>
          )}

          {bookingNotes && (
            <Section style={notesBox}>
              <Heading style={h3}>Client's Notes</Heading>
              <Text style={text}>{bookingNotes}</Text>
            </Section>
          )}

          <Section style={buttonContainer}>
            <Link href={`${appUrl}/trainer/dashboard`} style={button}>
              View in Dashboard
            </Link>
          </Section>

          <Text style={footerText}>
            {notificationType === 'new_booking' && 
              "Make sure to prepare for the call and review the client's goals and notes."
            }
            {notificationType === 'cancellation' && 
              "This time slot is now available for other bookings."
            }
            {notificationType === 'reschedule' && 
              "Please check your calendar and confirm the new time works for you."
            }
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default TrainerNotification

const main = {
  backgroundColor: '#f6f9fc',
  padding: '20px 0',
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e6ebf1',
  borderRadius: '6px',
  margin: '0 auto',
  padding: '45px',
  width: '100%',
  maxWidth: '600px',
}

const h1 = {
  color: '#1a1a1a',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '28px',
  fontWeight: 'bold',
  lineHeight: '1.3',
  margin: '0 0 20px',
}

const h2 = {
  color: '#1a1a1a',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 15px',
}

const h3 = {
  color: '#1a1a1a',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 10px',
}

const text = {
  color: '#4a5568',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0 0 16px',
}

const detailText = {
  color: '#1a1a1a',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0',
}

const callDetailsBox = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  padding: '20px',
  margin: '20px 0',
}

const notesBox = {
  backgroundColor: '#eef2ff',
  border: '1px solid #c7d2fe',
  borderRadius: '6px',
  padding: '16px',
  margin: '20px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
}

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'inline-block',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '1',
  padding: '12px 24px',
  textDecoration: 'none',
}

const footerText = {
  color: '#718096',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '14px',
  lineHeight: '1.4',
  margin: '20px 0',
  textAlign: 'center' as const,
}