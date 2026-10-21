import { useState, useEffect, lazy, Suspense, memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Spinner from './Spinner'
import ErrorMessage from './ErrorMessage'
import { clearToken, getToken } from './auth'

// Supplementary Problem 1: Lazy load heavy third-party report component (jspdf)
const TaskReportModal = lazy(() => import('./TaskReportModal'))

function TodoList() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const API_URL = `${API_BASE}/tasks`
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([])
  const [userEmail, setUserEmail] = useState('')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Edit states
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  // Modal confirmation state
  const [taskToDelete, setTaskToDelete] = useState(null)

  // Lazy loaded report modal state
  const [showReportModal, setShowReportModal] = useState(false)

  const handleUnauthorized = () => {
    clearToken()
    navigate('/login', { replace: true })
  }

  const authenticatedFetch = (url, options = {}) => {
    const token = getToken()
    if (!token) {
      handleUnauthorized()
      return Promise.reject(new Error('Please log in to manage tasks.'))
    }

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      if (res.status === 401) {
        handleUnauthorized()
        throw new Error('Your session has expired. Please log in again.')
      }
      return res
    })
  }

  // Helper to show temporary notification
  const showNotification = (msg) => {
    setSuccessMessage(msg)
    setTimeout(() => {
      setSuccessMessage(null)
    }, 3000)
  }

  // Fetch all tasks from Express server
  const fetchTasks = () => {
    setLoading(true)
    setError(null)
    authenticatedFetch(API_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load tasks (Status: ${res.status})`)
        }
        return res.json()
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setTasks(data)
        } else {
          throw new Error('API returned an invalid data format')
        }
      })
      .catch((err) => {
        setError(err.message || 'Could not connect to task API server.')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const fetchCurrentUser = () => {
    authenticatedFetch(`${API_BASE}/me`)
      .then((res) => res.json())
      .then((user) => setUserEmail(user.email || ''))
      .catch(() => setUserEmail(''))
  }

  useEffect(() => {
    const fetchOnMount = window.setTimeout(() => {
      if (getToken()) {
        fetchCurrentUser()
        fetchTasks()
      } else {
        handleUnauthorized()
      }
    }, 0)

    return () => window.clearTimeout(fetchOnMount)
    // These handlers intentionally use the current token and navigate target on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Create a new task (POST)
  const handleAddTask = (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    setActionError(null)

    authenticatedFetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: newTaskTitle, description: newTaskDescription, status: 'pending' }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            throw new Error(errData.message || 'Failed to add task.')
          })
        }
        return res.json()
      })
      .then((newTask) => {
        setTasks((prevTasks) => [newTask, ...prevTasks])
        setNewTaskTitle('')
        setNewTaskDescription('')
        showNotification('Task created successfully!')
      })
      .catch((err) => {
        setActionError(err.message)
      })
  }

  const handleGenerateDescription = () => {
    const title = newTaskTitle.trim()
    if (!title) {
      setActionError('Enter a task title before generating a description.')
      return
    }
    setActionError(null)
    setIsGeneratingDescription(true)
    authenticatedFetch(`${API_BASE}/api/ai/generate-description`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Description generation is unavailable.')
        setNewTaskDescription(data.description || '')
      })
      .catch((err) => setActionError(err.message || 'Description generation is unavailable.'))
      .finally(() => setIsGeneratingDescription(false))
  }

  const getTaskStatus = (task) => task?.status || (task?.completed ? 'completed' : 'pending')

  const handleStatusChange = useCallback((id, status) => {
    setActionError(null)
    const currentTask = tasks.find((task) => task._id === id)
    const currentStatus = getTaskStatus(currentTask)
    const statusOrder = { pending: 0, working: 1, completed: 2 }
    if (statusOrder[status] < statusOrder[currentStatus]) {
      setActionError('Task status can only move from pending to ongoing to completed.')
      return
    }
    authenticatedFetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, completed: status === 'completed' }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            throw new Error(errData.message || 'Failed to update task status.')
          })
        }
        return res.json()
      })
      .then((updatedTask) => {
        setTasks((prevTasks) => prevTasks.map((task) => (
          task._id === id ? updatedTask : task
        )))
        showNotification('Task status updated successfully!')
      })
      .catch((err) => setActionError(err.message))
  }, [tasks])

  // Start editing a task (memoized callback)
  const handleStartEdit = useCallback((task) => {
    setEditingTaskId(task._id)
    setEditTitle(task.title)
    setActionError(null)
  }, [])

  // Cancel editing (memoized callback)
  const handleCancelEdit = useCallback(() => {
    setEditingTaskId(null)
    setEditTitle('')
  }, [])

  const handleEditTitleChange = useCallback((value) => {
    setEditTitle(value)
  }, [])

  const handleDeleteClick = useCallback((task) => {
    setTaskToDelete(task)
  }, [])

  // Save updated task title (PUT)
  const handleSaveEdit = useCallback((id) => {
    if (!editTitle.trim()) return
    setActionError(null)

    authenticatedFetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: editTitle }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            throw new Error(errData.message || 'Failed to update task title.')
          })
        }
        return res.json()
      })
      .then((updatedTask) => {
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t._id === id ? updatedTask : t))
        )
        setEditingTaskId(null)
        setEditTitle('')
        showNotification('Task updated successfully!')
      })
      .catch((err) => {
        setActionError(err.message)
      })
  }, [editTitle])

  // Confirmed execution of task deletion
  const confirmDeleteTask = () => {
    if (!taskToDelete) return
    const id = taskToDelete._id
    setActionError(null)

    authenticatedFetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            throw new Error(errData.message || 'Failed to delete task.')
          })
        }
        return res.json()
      })
      .then(() => {
        setTasks((prevTasks) => prevTasks.filter((t) => t._id !== id))
        showNotification('Task deleted successfully!')
      })
      .catch((err) => {
        setActionError(err.message)
      })
      .finally(() => {
        setTaskToDelete(null)
      })
  }

  const statusGroups = [
    ['pending', 'Pending'],
    ['working', 'Ongoing'],
    ['completed', 'Completed'],
  ]
  const visibleGroups = activeFilter === 'all'
    ? statusGroups
    : statusGroups.filter(([status]) => status === activeFilter)
  const hasVisibleTasks = visibleGroups.some(([status]) => (
    tasks.some((task) => getTaskStatus(task) === status)
  ))

  return (
    <div className="page-route-container">
      <section className="section-block">
        <div className="section-heading">
          <p className="section-tag">Express CRUD Integration</p>
          <h2>Task Manager To-Do List</h2>
          {userEmail && <p className="logged-in-email">{userEmail}</p>}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="primary-button"
              onClick={() => setShowReportModal(true)}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '0.9rem',
              }}
            >
              📊 View Analytics &amp; PDF Report
            </button>
            <button type="button" className="ghost-button" onClick={handleUnauthorized}>
              Logout
            </button>
          </div>
        </div>

        {/* Success Notifications */}
        {successMessage && (
          <div className="success-banner error-banner-alert" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', marginBottom: '16px' }}>
            ✅ {successMessage}
          </div>
        )}

        {/* Action Error Alerts */}
        {actionError && (
          <div className="success-banner error-banner-alert" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', marginBottom: '16px' }}>
            ⚠️ {actionError}
          </div>
        )}

        <div className="todo-layout">
          {/* Add Task Form Card */}
          <div className="todo-form-card panel">
            <form onSubmit={handleAddTask} className="username-form">
              <label htmlFor="new-task-title-input">
                <strong>Create New Task:</strong>
              </label>
              <div className="username-input-row">
                <input
                  id="new-task-title-input"
                  type="text"
                  className="search-input"
                  placeholder="What needs to be done? (e.g. Finish Practical 4)"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                />
                <button type="submit" className="primary-button">
                  Add Task
                </button>
              </div>
              <label htmlFor="new-task-description-input">
                <strong>Description:</strong>
              </label>
              <textarea
                id="new-task-description-input"
                className="search-input"
                rows="3"
                placeholder="Add details or generate a suggestion"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
              />
              <button
                type="button"
                className="ghost-button"
                onClick={handleGenerateDescription}
                disabled={isGeneratingDescription}
              >
                {isGeneratingDescription ? 'Generating...' : 'Generate description'}
              </button>
              <small>AI-generated suggestion — review and edit before saving.</small>
            </form>
            <div className="status-filter-bar" role="group" aria-label="Filter tasks by status">
              {[
                ['all', 'All'],
                ['pending', 'Pending'],
                ['working', 'Ongoing'],
                ['completed', 'Completed'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`status-filter-button ${activeFilter === value ? 'active' : ''}`}
                  onClick={() => setActiveFilter(value)}
                  aria-pressed={activeFilter === value}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks List */}
          {loading && <Spinner username="Express Task Server" />}

          {!loading && error && (
            <ErrorMessage message={error} onRetry={fetchTasks} />
          )}

          {!loading && !error && (
            <div className="todo-list-container">
              {!hasVisibleTasks ? (
                <div className="empty-search-box panel">
                  <p>{tasks.length === 0 ? 'No tasks remaining! Add a task above to get started.' : 'No tasks match this status.'}</p>
                </div>
              ) : (
                <div className="status-groups">
                  {visibleGroups.map(([status, label]) => {
                    const groupTasks = tasks.filter((task) => getTaskStatus(task) === status)
                    if (groupTasks.length === 0) return null

                    return (
                      <section className="status-group" key={status}>
                        <h3 className="status-group-title">{label}</h3>
                        <div className="todo-grid">
                          {groupTasks.map((task) => (
                            <TaskCard
                              key={task._id}
                              task={task}
                              taskStatus={getTaskStatus(task)}
                              isEditing={editingTaskId === task._id}
                              editTitle={editTitle}
                              onEditTitleChange={handleEditTitleChange}
                              onSaveEdit={handleSaveEdit}
                              onCancelEdit={handleCancelEdit}
                              onStartEdit={handleStartEdit}
                              onStatusChange={handleStatusChange}
                              onDeleteClick={handleDeleteClick}
                            />
                          ))}
                        </div>
                      </section>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Custom Confirmation Modal */}
        {taskToDelete && (
          <div className="modal-overlay">
            <div className="modal-card panel">
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>Confirm Deletion</h3>
              <p style={{ margin: '0 0 20px 0', color: 'var(--text)' }}>
                Are you sure you want to delete <strong>"{taskToDelete.title}"</strong>? This action cannot be undone.
              </p>
              <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setTaskToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="primary-button delete-confirm-btn"
                  onClick={confirmDeleteTask}
                  style={{ background: '#dc2626', color: '#ffffff', borderColor: '#dc2626' }}
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lazy-Loaded Task Analytics & PDF Report Modal (Supplementary Problem 1) */}
        {showReportModal && (
          <Suspense fallback={<div className="modal-overlay"><Spinner username="Report Generator" /></div>}>
            <TaskReportModal
              tasks={tasks}
              userEmail={userEmail}
              onClose={() => setShowReportModal(false)}
            />
          </Suspense>
        )}
      </section>
    </div>
  )
}

/**
 * TaskCard - Supplementary Problem 3 & Post-Lab Work:
 * Memoized with React.memo to prevent unnecessary re-renders of the task list
 * whenever the user types into the `newTaskTitle` input in the parent component.
 */
const TaskCard = memo(function TaskCard({
  task,
  taskStatus,
  isEditing,
  editTitle,
  onEditTitleChange,
  onSaveEdit,
  onCancelEdit,
  onStartEdit,
  onStatusChange,
  onDeleteClick,
}) {
  return (
    <article
      className={`todo-card panel ${task.completed ? 'completed' : ''} ${
        isEditing ? 'editing' : ''
      }`}
    >
      {isEditing ? (
        /* Editing View */
        <div className="todo-edit-row">
          <input
            type="text"
            className="search-input todo-edit-input"
            value={editTitle}
            onChange={(e) => onEditTitleChange(e.target.value)}
            required
            aria-label="Edit task title"
          />
          <div className="todo-edit-actions">
            <button
              type="button"
              className="primary-button edit-save-btn"
              onClick={() => onSaveEdit(task._id)}
            >
              Save
            </button>
            <button
              type="button"
              className="ghost-button edit-cancel-btn"
              onClick={onCancelEdit}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Regular View */
        <>
          <div className="todo-content-row">
            <span className="todo-title">{task.title}</span>
            <select
              className="task-status-select"
              value={taskStatus}
              onChange={(e) => onStatusChange(task._id, e.target.value)}
              aria-label={`Status for ${task.title}`}
            >
              <option value="pending" disabled={taskStatus !== 'pending'}>Pending</option>
              <option value="working" disabled={taskStatus === 'completed'}>Ongoing</option>
              <option value="completed" disabled={taskStatus === 'pending'}>Completed</option>
            </select>
          </div>
          <div className="todo-actions-row">
            <button
              type="button"
              className="edit-task-btn"
              onClick={() => onStartEdit(task)}
              aria-label="Edit task title"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '6px' }}
            >
              ✏️
            </button>
            <button
              type="button"
              className="delete-task-btn"
              onClick={() => onDeleteClick(task)}
              aria-label="Delete task"
            >
              🗑️
            </button>
          </div>
        </>
      )}
    </article>
  )
})

export default TodoList
