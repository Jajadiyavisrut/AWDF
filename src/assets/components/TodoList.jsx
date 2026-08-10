import { useState, useEffect } from 'react'
import Spinner from './Spinner'
import ErrorMessage from './ErrorMessage'

function TodoList() {
  const API_URL = 'http://localhost:5000/tasks'

  const [tasks, setTasks] = useState([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)

  // Edit states
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  // Fetch all tasks from Express server
  const fetchTasks = () => {
    setLoading(true)
    setError(null)
    fetch(API_URL)
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
    fetchTasks()
  }, [])

  // Create a new task (POST)
  const handleAddTask = (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    setActionError(null)

    fetch(API_URL, {
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
      })
      .catch((err) => {
        setActionError(err.message)
      })
  }

  // Toggle task completion (PUT)
  const handleToggleTask = (id, currentCompleted) => {
    setActionError(null)
    fetch(`${API_URL}/${id}`, {
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

    fetch(`${API_URL}/${id}`, {
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
      })
      .catch((err) => {
        setActionError(err.message)
      })
  }

  // Delete a task (DELETE)
  const handleDeleteTask = (id) => {
    setActionError(null)
    fetch(`${API_URL}/${id}`, {
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
      })
      .catch((err) => {
        setActionError(err.message)
      })
  }

  return (
    <div className="page-route-container">
      <section className="section-block">
        <div className="section-heading">
          <p className="section-tag">Express CRUD Integration</p>
          <h2>Task Manager To-Do List</h2>
        </div>

        {/* Action Error Alerts */}
        {actionError && (
          <div className="success-banner error-banner-alert" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5' }}>
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
                              onClick={() => handleDeleteTask(task._id)}
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
      </section>
    </div>
  )
}

export default TodoList
