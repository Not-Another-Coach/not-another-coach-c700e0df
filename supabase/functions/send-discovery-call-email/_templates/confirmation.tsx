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
  Row,
  Column,
} from 'npm:@react-email/components@0.0.22'

interface DiscoveryCallConfirmationProps {
  clientName: string
  trainerName: string
  scheduledDate: string
  scheduledTime: string
  duration: number
  prepNotes?: string
  bookingNotes?: string
  appUrl: string
}

export const DiscoveryCallConfirmation = ({
  clientName,
  trainerName,
  scheduledDate,
  scheduledTime,
  duration,
  prepNotes,
  bookingNotes,
  appUrl
}: DiscoveryCallConfirmationProps) => (
  <Html>
    <Head />
    <Preview>Your discovery call with {trainerName} is confirmed</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Discovery Call Confirmed! 🎉</Heading>
        
        <Text style={text}>
          Hi {clientName},
        </Text>
        
        <Text style={text}>
          Great news! Your discovery call with <strong>{trainerName}</strong> has been successfully booked.
        </Text>

        <Section style={callDetailsBox}>
          <Heading style={h2}>Call Details</Heading>
          <Row>
            <Column>
              <Text style={detailLabel}>Date:</Text>
              <Text style={detailValue}>{scheduledDate}</Text>
            </Column>
            <Column>
              <Text style={detailLabel}>Time:</Text>
              <Text style={detailValue}>{scheduledTime}</Text>
            </Column>
          </Row>
          <Row>
            <Column>
              <Text style={detailLabel}>Duration:</Text>
              <Text style={detailValue}>{duration} minutes</Text>
            </Column>
            <Column>
              <Text style={detailLabel}>With:</Text>
              <Text style={detailValue}>{trainerName}</Text>
            </Column>
          </Row>
        </Section>

        {bookingNotes && (
          <Section style={notesBox}>
            <Heading style={h3}>Your Notes</Heading>
            <Text style={text}>{bookingNotes}</Text>
          </Section>
        )}

        {prepNotes && (
          <Section style={prepBox}>
            <Heading style={h3}>Preparation Notes from {trainerName}</Heading>
            <Text style={text}>{prepNotes}</Text>
          </Section>
        )}

        <Section style={buttonContainer}>
          <Link href={`${appUrl}/client/dashboard`} style={button}>
            View in Dashboard
          </Link>
        </Section>

        <Text style={footerText}>
          You'll receive reminder emails 24 hours and 1 hour before your call.
        </Text>

        <Text style={footer}>
          Need to reschedule or cancel? Visit your dashboard or contact {trainerName} directly.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default DiscoveryCallConfirmation

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

const callDetailsBox = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  padding: '20px',
  margin: '20px 0',
}

const detailLabel = {
  color: '#718096',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px',
}

const detailValue = {
  color: '#1a1a1a',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 16px',
}

const notesBox = {
  backgroundColor: '#eef2ff',
  border: '1px solid #c7d2fe',
  borderRadius: '6px',
  padding: '16px',
  margin: '20px 0',
}

const prepBox = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
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

const footer = {
  color: '#a0aec0',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: '12px',
  lineHeight: '1.4',
  margin: '30px 0 0',
  textAlign: 'center' as const,
}