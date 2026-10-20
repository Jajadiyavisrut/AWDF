const NodeCache = require('node-cache');

// Step 2: Initialize NodeCache instance with standard TTL of 60 seconds
const cache = new NodeCache({
  stdTTL: 60,       // Default time-to-live: 60 seconds
  checkperiod: 120, // Automatic expired key cleanup period
  useClones: false, // Increases performance by bypassing deep clones
});

// Supplementary Problem 2: Cache hit and miss telemetry counters
let cacheHits = 0;
let cacheMisses = 0;

/**
 * Generates user-scoped cache key for the all-tasks collection
 * @param {string} [userId='default']
 * @returns {string}
 */
function getUserTasksKey(userId = 'default') {
  return `tasks:${userId}:all`;
}

/**
 * Generates user-scoped cache key for a single task document
 * @param {string} [userId='default']
 * @param {string} taskId
 * @returns {string}
 */
function getSingleTaskKey(userId = 'default', taskId) {
  return `task:${userId}:${taskId}`;
}

/**
 * Records a cache hit
 */
function recordHit() {
  cacheHits += 1;
}

/**
 * Records a cache miss
 */
function recordMiss() {
  cacheMisses += 1;
}

/**
 * Invalidates cached data for a specific user upon write operations (POST, PUT, DELETE)
 * @param {string} [userId='default']
 * @param {string} [taskId=null]
 */
function invalidateUserTasks(userId = 'default', taskId = null) {
  const collectionKey = getUserTasksKey(userId);
  cache.del(collectionKey);

  // If a specific task ID was modified, invalidate its individual cache entry too
  if (taskId) {
    cache.del(getSingleTaskKey(userId, taskId));
  }
}

/**
 * Resets debug statistics
 */
function resetStats() {
  cacheHits = 0;
  cacheMisses = 0;
}

/**
 * Returns comprehensive cache debug statistics and hit/miss rates
 */
function getCustomStats() {
  const total = cacheHits + cacheMisses;
  const hitRatio = total > 0 ? ((cacheHits / total) * 100).toFixed(1) + '%' : '0.0%';
  return {
    hits: cacheHits,
    misses: cacheMisses,
    totalRequests: total,
    hitRatio,
    ttlSeconds: 60,
    cachedKeysCount: cache.keys().length,
    keys: cache.keys(),
    internalStats: cache.getStats(),
  };
}

module.exports = {
  cache,
  getUserTasksKey,
  getSingleTaskKey,
  recordHit,
  recordMiss,
  invalidateUserTasks,
  resetStats,
  getCustomStats,
};
