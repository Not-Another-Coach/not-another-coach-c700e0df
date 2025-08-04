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

interface DiscoveryCallReminderProps {
  clientName: string
  trainerName: string
  scheduledDate: string
  scheduledTime: string
  duration: number
  timeUntil: string
  prepNotes?: string
  appUrl: string
}

export const DiscoveryCallReminder = ({
  clientName,
  trainerName,
  scheduledDate,
  scheduledTime,
  duration,
  timeUntil,
  prepNotes,
  appUrl
}: DiscoveryCallReminderProps) => (
  <Html>
    <Head />
    <Preview>Reminder: Your discovery call with {trainerName} is {timeUntil}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Discovery Call Reminder ⏰</Heading>
        
        <Text style={text}>
          Hi {clientName},
        </Text>
        
        <Text style={text}>
          This is a friendly reminder that your discovery call with <strong>{trainerName}</strong> is coming up {timeUntil}.
        </Text>

        <Section style={callDetailsBox}>
          <Heading style={h2}>Call Details</Heading>
          <Text style={detailText}>
            <strong>Date:</strong> {scheduledDate}<br/>
            <strong>Time:</strong> {scheduledTime}<br/>
            <strong>Duration:</strong> {duration} minutes<br/>
            <strong>With:</strong> {trainerName}
          </Text>
        </Section>

        {prepNotes && (
          <Section style={prepBox}>
            <Heading style={h3}>Preparation Notes</Heading>
            <Text style={text}>{prepNotes}</Text>
          </Section>
        )}

        <Section style={tipsBox}>
          <Heading style={h3}>Tips for Your Discovery Call</Heading>
          <Text style={text}>
            • Be ready to discuss your fitness goals<br/>
            • Think about your preferred training style<br/>
            • Consider your schedule and availability<br/>
            • Prepare any questions you have about training
          </Text>
        </Section>

        <Section style={buttonContainer}>
          <Link href={`${appUrl}/client/dashboard`} style={button}>
            View Call Details
          </Link>
        </Section>

        <Text style={footerText}>
          Need to reschedule or cancel? Please do so as soon as possible to respect {trainerName}'s time.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default DiscoveryCallReminder

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
  backgroundColor: '#fef3cd',
  border: '1px solid #fbbf24',
  borderRadius: '6px',
  padding: '20px',
  margin: '20px 0',
}

const prepBox = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '6px',
  padding: '16px',
  margin: '20px 0',
}

const tipsBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
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