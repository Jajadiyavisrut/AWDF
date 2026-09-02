import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Spinner from './Spinner'
import ErrorMessage from './ErrorMessage'
import { clearToken, getToken } from './auth'

function TodoList() {
  const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/tasks`
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Edit states
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  // Modal confirmation state
  const [taskToDelete, setTaskToDelete] = useState(null)

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

  useEffect(() => {
    const fetchOnMount = window.setTimeout(() => {
      if (getToken()) {
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
      body: JSON.stringify({ title: newTaskTitle }),
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
        showNotification('Task created successfully!')
      })
      .catch((err) => {
        setActionError(err.message)
      })
  }

  // Toggle task completion (PUT)
  const handleToggleTask = (id, currentCompleted) => {
    setActionError(null)
    authenticatedFetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed: !currentCompleted }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            throw new Error(errData.message || 'Failed to update task.')
          })
        }
        return res.json()
      })
      .then((updatedTask) => {
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t._id === id ? updatedTask : t))
        )
        showNotification('Task updated successfully!')
      })
      .catch((err) => {
        setActionError(err.message)
      })
  }

  // Start editing a task
  const handleStartEdit = (task) => {
    setEditingTaskId(task._id)
    setEditTitle(task.title)
    setActionError(null)
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingTaskId(null)
    setEditTitle('')
  }

  // Save updated task title (PUT)
  const handleSaveEdit = (id) => {
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
  }

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

  return (
    <div className="page-route-container">
      <section className="section-block">
        <div className="section-heading">
          <p className="section-tag">Express CRUD Integration</p>
          <h2>Task Manager To-Do List</h2>
          <button type="button" className="ghost-button" onClick={handleUnauthorized}>
            Logout
          </button>
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
            </form>
          </div>

          {/* Tasks List */}
          {loading && <Spinner username="Express Task Server" />}

          {!loading && error && (
            <ErrorMessage message={error} onRetry={fetchTasks} />
          )}

          {!loading && !error && (
            <div className="todo-list-container">
              {tasks.length === 0 ? (
                <div className="empty-search-box panel">
                  <p>No tasks remaining! Add a task above to get started.</p>
                </div>
              ) : (
                <div className="todo-grid">
                  {tasks.map((task) => (
                    <article
                      key={task._id}
                      className={`todo-card panel ${task.completed ? 'completed' : ''} ${
                        editingTaskId === task._id ? 'editing' : ''
                      }`}
                    >
                      {editingTaskId === task._id ? (
                        /* Editing View */
                        <div className="todo-edit-row">
                          <input
                            type="text"
                            className="search-input todo-edit-input"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            required
                          />
                          <div className="todo-edit-actions">
                            <button
                              type="button"
                              className="primary-button edit-save-btn"
                              onClick={() => handleSaveEdit(task._id)}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="ghost-button edit-cancel-btn"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Regular View */
                        <>
                          <div className="todo-content-row">
                            <label className="checkbox-container">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleTask(task._id, task.completed)}
                              />
                              <span className="checkmark"></span>
                            </label>
                            <span className="todo-title">{task.title}</span>
                          </div>
                          <div className="todo-actions-row">
                            <button
                              type="button"
                              className="edit-task-btn"
                              onClick={() => handleStartEdit(task)}
                              aria-label="Edit task title"
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '6px' }}
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              className="delete-task-btn"
                              onClick={() => setTaskToDelete(task)}
                              aria-label="Delete task"
                            >
                              🗑️
                            </button>
                          </div>
                        </>
                      )}
                    </article>
                  ))}
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
      </section>
    </div>
  )
}

export default TodoList
