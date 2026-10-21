const taskEvents = require('./events');

// In-memory telemetry log of processed notification events for verification/debug
const notificationLogs = [];

/**
 * Registers all background event listeners for task processing.
 */
function registerListeners() {
  // Listener for 'task-created'
  taskEvents.on('task-created', (data) => {
    try {
      const { taskId, title, ownerId, ownerEmail, timestamp } = data || {};
      const startTime = new Date().toISOString();
      const safeUser = ownerEmail || ownerId || 'unassigned';
      const safeTitle = title || 'Untitled Task';

      console.log(`[Notification START] Task: ${safeTitle} | Assigned user: ${safeUser} | Time: ${startTime}`);

      // Simulate a non-blocking slow background notification service (2-second processing delay)
      setTimeout(() => {
        try {
          const completeTime = new Date().toISOString();
          console.log(`[Notification COMPLETE] Task: ${safeTitle} | Time: ${completeTime}`);
          
          notificationLogs.push({
            event: 'task-created',
            taskId,
            title: safeTitle,
            assignedUser: safeUser,
            startedAt: startTime,
            completedAt: completeTime,
            status: 'delivered'
          });
        } catch (innerErr) {
          console.error(`[Notification ERROR] Failure during completion of task "${safeTitle}":`, innerErr.message);
        }
      }, 2000);
    } catch (err) {
      console.error('[Notification ERROR] Failed to process task-created event:', err.message);
    }
  });

  // Listener for 'task-updated'
  taskEvents.on('task-updated', (data) => {
    try {
      const { taskId, title, status, ownerId, ownerEmail } = data || {};
      const time = new Date().toISOString();
      const safeUser = ownerEmail || ownerId || 'unassigned';
      console.log(`[Notification UPDATE] Task: ${title} | Status: ${status} | User: ${safeUser} | Time: ${time}`);
      
      notificationLogs.push({
        event: 'task-updated',
        taskId,
        title,
        status,
        assignedUser: safeUser,
        timestamp: time
      });
    } catch (err) {
      console.error('[Notification ERROR] Failed to process task-updated event:', err.message);
    }
  });

  // Listener for 'task-deleted'
  taskEvents.on('task-deleted', (data) => {
    try {
      const { taskId, title, ownerId, ownerEmail } = data || {};
      const time = new Date().toISOString();
      const safeUser = ownerEmail || ownerId || 'unassigned';
      console.log(`[Notification DELETED] Task: ${title} | User: ${safeUser} | Time: ${time}`);
      
      notificationLogs.push({
        event: 'task-deleted',
        taskId,
        title,
        assignedUser: safeUser,
        timestamp: time
      });
    } catch (err) {
      console.error('[Notification ERROR] Failed to process task-deleted event:', err.message);
    }
  });

  // Error listener to catch unhandled emitter errors
  taskEvents.on('error', (err) => {
    console.error('[TaskEvents Global Error Listener]:', err.message);
  });
}

function getNotificationLogs() {
  return [...notificationLogs];
}

function clearNotificationLogs() {
  notificationLogs.length = 0;
}

module.exports = {
  registerListeners,
  getNotificationLogs,
  clearNotificationLogs,
};
