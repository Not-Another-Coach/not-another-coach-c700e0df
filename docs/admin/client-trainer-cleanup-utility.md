# Client-Trainer Interaction Cleanup Utility

## Overview

The **Client-Trainer Interaction Cleanup** utility is an administrative tool that allows admins to completely remove all interaction history between a specific client and trainer. This tool is primarily designed for testing purposes, data management, and resetting relationships to allow fresh testing of user workflows.

## Access Requirements

- **Admin Role Required**: Only users with admin privileges can access this utility
- **Location**: Admin Dashboard → Data Cleanup tab
- **Security**: All cleanup operations are logged for audit purposes

## What Gets Deleted

When you run a cleanup operation, the following data is permanently removed:

### Communication Data
- **Messages**: All chat messages between the client and trainer
- **Conversations**: Conversation threads and metadata
- **Read receipts**: Message read status and timestamps

### Discovery Call Data
- **Discovery Calls**: All scheduled, completed, or cancelled discovery calls
- **Call Feedback**: Client feedback submitted after discovery calls
- **Feedback Responses**: Detailed responses to feedback questions
- **Call Notes**: Trainer notes taken during or after calls
- **Call Notifications**: Email notifications and reminders

### Engagement Data
- **Engagement Records**: Likes, shortlists, matches, and progression tracking
- **Coach Selection Requests**: All requests to work with the trainer
- **Waitlist Entries**: Entries on the trainer's waitlist

### System Data
- **Alerts**: Activity notifications related to their interactions
- **Feedback Notifications**: Scheduled feedback reminders

## How to Use the Cleanup Tool

### Step 1: Access the Tool
1. Navigate to the **Admin Dashboard**
2. Click on the **"Data Cleanup"** tab
3. Locate the **"Client-Trainer Interaction Cleanup"** card

### Step 2: Select Users
1. **Select Client**: 
   - Click the "Select Client" dropdown
   - Search or scroll to find the desired client
   - Click to select

2. **Select Trainer**:
   - Click the "Select Trainer" dropdown  
   - Search or scroll to find the desired trainer
   - Click to select

### Step 3: Review Selection
- A preview box will show your selected client and trainer
- Verify you have selected the correct users before proceeding

### Step 4: Execute Cleanup
1. Click the **"Run Cleanup"** button
2. Read the confirmation dialog carefully
3. Click **"OK"** to proceed or **"Cancel"** to abort
4. Wait for the operation to complete (usually takes a few seconds)

### Step 5: Review Results
- A results card will appear showing what was deleted
- Each category shows the number of records removed
- The total count provides an overview of the cleanup scope

## Safety Features

### Confirmation Dialog
Before any data is deleted, you'll see a detailed confirmation that includes:
- Names of both users involved
- Complete list of data types that will be deleted  
- Warning that the action cannot be undone

### Admin-Only Access
- Database-level security prevents non-admin users from running cleanups
- All operations are logged with the admin's ID and timestamp

### Audit Trail
Every cleanup operation creates an audit log entry containing:
- Admin who performed the action
- Target client and trainer IDs
- Detailed breakdown of deleted records
- Timestamp of the operation

## Common Use Cases

### Testing Workflows
- **Fresh Start Testing**: Reset a client-trainer relationship to test the complete user journey from scratch
- **Bug Reproduction**: Clear existing data to reproduce specific issues
- **Feature Testing**: Test new features with clean data states

### Data Management
- **Privacy Requests**: Remove specific user interactions when requested
- **Data Cleanup**: Remove test or invalid data from production
- **Relationship Reset**: Allow users to start fresh with a trainer

### Quality Assurance
- **Regression Testing**: Ensure features work correctly with fresh data
- **Performance Testing**: Test system performance with clean datasets
- **User Experience Testing**: Validate the complete user journey

## Best Practices

### Before Running Cleanup
1. **Verify User Selection**: Double-check you have the correct client and trainer
2. **Communicate**: Inform relevant team members about planned cleanups
3. **Document Purpose**: Note why the cleanup is being performed

### During Cleanup
1. **Single Operation**: Don't run multiple cleanups simultaneously
2. **Monitor Results**: Review the cleanup results for expected counts
3. **Handle Errors**: If errors occur, check logs and retry if necessary

### After Cleanup
1. **Verify Success**: Confirm the relationship has been reset as expected
2. **Test Functionality**: Verify that new interactions work correctly
3. **Document Results**: Record what was accomplished for future reference

## Troubleshooting

### Common Issues

**"Unauthorized" Error**
- Ensure you have admin privileges
- Log out and log back in to refresh permissions
- Contact a system administrator if issues persist

**No Users in Dropdown**
- Check that users exist in the system with the correct user types
- Verify the users have completed profile setup
- Refresh the page to reload user data

**Cleanup Fails**
- Check console logs for detailed error messages
- Verify both users still exist in the system
- Ensure you have admin privileges
- Try refreshing the page and attempting again

**Unexpected Results**
- Some counts may be zero if no data existed for that category
- Review the breakdown to understand what was actually deleted
- Check that you selected the intended users

## Limitations

### What Is NOT Deleted
- **User Profiles**: The client and trainer profiles remain intact
- **Account Data**: Login credentials and basic account information
- **System Settings**: User preferences and configuration settings
- **Other Relationships**: Interactions with other users are not affected

### Technical Limitations
- **One Relationship at a Time**: Can only clean one client-trainer pair per operation
- **Admin Access Only**: Cannot be delegated to non-admin users
- **Irreversible**: No undo functionality - deleted data cannot be recovered

## Security Considerations

### Data Protection
- All operations are logged for compliance and audit purposes
- Deleted data is permanently removed and cannot be recovered
- Only authorized admin users can perform cleanup operations

### Privacy Compliance
- Use this tool responsibly in accordance with privacy policies
- Document cleanup operations when required for compliance
- Ensure proper authorization before cleaning user data

## Support

If you encounter issues with the Cleanup Utility:

1. **Check the Console**: Look for error messages in the browser console
2. **Review Audit Logs**: Check the admin actions log for detailed information
3. **Contact Support**: Provide the specific error message and context
4. **Documentation**: Refer to this guide for common troubleshooting steps

---

*Last Updated: [Current Date]*
*Document Version: 1.0*