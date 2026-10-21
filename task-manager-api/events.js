const EventEmitter = require('events');

/**
 * TaskEvents - Custom EventEmitter instance for asynchronous task-related events.
 * Enables non-blocking event-driven processing across application components.
 */
class TaskEvents extends EventEmitter {}

const taskEvents = new TaskEvents();

// Set sensible max listeners limit if multiple services listen to events
taskEvents.setMaxListeners(20);

module.exports = taskEvents;
