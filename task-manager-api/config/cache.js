const NodeCache = require('node-cache');

// Configurable standard TTL from environment variable (default: 60 seconds)
const TTL_SECONDS = process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL, 10) : 60;
const CHECK_PERIOD = process.env.CACHE_CHECK_PERIOD ? parseInt(process.env.CACHE_CHECK_PERIOD, 10) : 120;

// Initialize NodeCache instance with standard TTL
const cache = new NodeCache({
  stdTTL: TTL_SECONDS,
  checkperiod: CHECK_PERIOD,
  useClones: false, // Performance optimization: avoids deep cloning object graphs
});

// Telemetry metrics
let cacheHits = 0;
let cacheMisses = 0;

/**
 * Generates user-scoped cache key for the all-tasks collection
 * Ensures data isolation across different users.
 * @param {string} userId
 * @returns {string}
 */
function getUserTasksKey(userId = 'default') {
  return `tasks:${userId}:all`;
}

/**
 * Generates user-scoped cache key for a single task document
 * @param {string} userId
 * @param {string} taskId
 * @returns {string}
 */
function getSingleTaskKey(userId = 'default', taskId) {
  return `task:${userId}:${taskId}`;
}

/**
 * Records a cache hit event
 */
function recordHit() {
  cacheHits += 1;
}

/**
 * Records a cache miss event
 */
function recordMiss() {
  cacheMisses += 1;
}

/**
 * Invalidates cached tasks for a specific user upon write operations (POST, PUT, PATCH, DELETE)
 * @param {string} userId
 * @param {string|null} [taskId=null]
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
 * Flushes all cached data and resets counters
 */
function flushCache() {
  cache.flushAll();
  resetStats();
}

/**
 * Returns comprehensive cache debug statistics and hit/miss rates
 * Complies with Section 7.B debug endpoint requirements.
 */
function getCustomStats() {
  const total = cacheHits + cacheMisses;
  const hitRatio = total > 0 ? ((cacheHits / total) * 100).toFixed(1) + '%' : '0.0%';
  return {
    status: 'online',
    hits: cacheHits,
    misses: cacheMisses,
    totalRequests: total,
    hitRatio,
    ttlSeconds: TTL_SECONDS,
    cachedKeysCount: cache.keys().length,
    keys: cache.keys(),
    internalStats: cache.getStats(),
  };
}

module.exports = {
  cache,
  TTL_SECONDS,
  getUserTasksKey,
  getSingleTaskKey,
  recordHit,
  recordMiss,
  invalidateUserTasks,
  resetStats,
  flushCache,
  getCustomStats,
};
