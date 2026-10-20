import { useState, useEffect, useRef } from 'react'
import Spinner from './Spinner'
import ErrorMessage from './ErrorMessage'

function Projects() {
  const MY_GITHUB_USERNAME = 'Jajadiyavisrut'

  const [username, setUsername] = useState(MY_GITHUB_USERNAME)
  const [inputUsername, setInputUsername] = useState(MY_GITHUB_USERNAME)
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const usernameInputRef = useRef(null)
  const itemsPerPage = 10

  const fetchRepos = (userToFetch = username) => {
    if (!userToFetch.trim()) return

    setLoading(true)
    setError(null)
    setCurrentPage(1)
    const cleanUsername = userToFetch.trim()
    setUsername(cleanUsername)

    fetch(`https://api.github.com/users/${cleanUsername}/repos?sort=updated&per_page=100`)
      .then((res) => {
        if (res.status === 404) {
          throw new Error(`GitHub user "${cleanUsername}" was not found. Please check the username.`)
        }
        if (!res.ok) {
          throw new Error(`Failed to fetch repositories for "${cleanUsername}" (Status: ${res.status})`)
        }
        return res.json()
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setRepos(data)
        } else {
          throw new Error('API returned an invalid data format')
        }
      })
      .catch((err) => {
        setError(err.message || 'Network error occurred while connecting to GitHub')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    let ignore = false
    fetch(`https://api.github.com/users/${MY_GITHUB_USERNAME}/repos?sort=updated&per_page=100`)
      .then((res) => {
        if (res.status === 404) {
          throw new Error(`GitHub user "${MY_GITHUB_USERNAME}" was not found. Please check the username.`)
        }
        if (!res.ok) {
          throw new Error(`Failed to fetch repositories for "${MY_GITHUB_USERNAME}" (Status: ${res.status})`)
        }
        return res.json()
      })
      .then((data) => {
        if (!ignore && Array.isArray(data)) {
          setRepos(data)
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Network error occurred while connecting to GitHub')
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  const handleMyReposClick = () => {
    setInputUsername(MY_GITHUB_USERNAME)
    fetchRepos(MY_GITHUB_USERNAME)
  }

  const handleSearchOtherClick = () => {
    setInputUsername('')
    if (usernameInputRef.current) {
      usernameInputRef.current.focus()
    }
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleUsernameSubmit = (e) => {
    e.preventDefault()
    if (inputUsername.trim()) {
      fetchRepos(inputUsername)
    }
  }

  const handlePresetClick = (presetUser) => {
    setInputUsername(presetUser)
    fetchRepos(presetUser)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    const filterSection = document.getElementById('search-filter-anchor')
    if (filterSection) {
      filterSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredRepos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRepos = filteredRepos.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="page-route-container">
      <section className="section-block">
        <div className="section-heading">
          <p className="section-tag">Live GitHub API Repositories</p>
          <h2>Explore project repositories fetched dynamically from GitHub</h2>
        </div>

        {/* GitHub Username Search Card */}
        <div className="username-search-card panel">
          {/* Quick Mode Buttons */}
          <div className="repo-mode-tabs">
            <button
              type="button"
              className={`tab-btn ${username === MY_GITHUB_USERNAME ? 'active' : ''}`}
              onClick={handleMyReposClick}
            >
              📁 My Repositories (@{MY_GITHUB_USERNAME})
            </button>
            <button
              type="button"
              className={`tab-btn ${username !== MY_GITHUB_USERNAME ? 'active' : ''}`}
              onClick={handleSearchOtherClick}
            >
              🔍 Search Other Users
            </button>
          </div>

          <form onSubmit={handleUsernameSubmit} className="username-form">
            <label htmlFor="github-username-input">
              <strong>GitHub Username:</strong>
            </label>
            <div className="username-input-row">
              <input
                ref={usernameInputRef}
                id="github-username-input"
                type="text"
                className="search-input"
                placeholder="Enter GitHub username (e.g. Jajadiyavisrut, torvalds, gaearon)..."
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                required
              />
              <button type="submit" className="primary-button">
                Search User Repos
              </button>
            </div>
          </form>

          <div className="preset-users">
            <span>Quick Presets:</span>
            <button
              type="button"
              className="chip-btn"
              onClick={() => handlePresetClick('Jajadiyavisrut')}
            >
              @Jajadiyavisrut
            </button>
            <button
              type="button"
              className="chip-btn"
              onClick={() => handlePresetClick('torvalds')}
            >
              @torvalds
            </button>
            <button
              type="button"
              className="chip-btn"
              onClick={() => handlePresetClick('gaearon')}
            >
              @gaearon
            </button>
            <button
              type="button"
              className="chip-btn"
              onClick={() => handlePresetClick('facebook')}
            >
              @facebook
            </button>
          </div>
        </div>

        {/* Conditional State 1: Loading */}
        {loading && <Spinner username={username} />}

        {/* Conditional State 2: Error with Retry button */}
        {!loading && error && (
          <ErrorMessage message={error} onRetry={() => fetchRepos(username)} />
        )}

        {/* Conditional State 3: Success Data View */}
        {!loading && !error && (
          <>
            <div className="search-filter-container" id="search-filter-anchor">
              <input
                type="text"
                className="search-input"
                placeholder={`🔍 Filter ${username}'s ${repos.length} repos by name...`}
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <span className="repo-count-badge">
                Page {currentPage} of {totalPages || 1} ({filteredRepos.length} repos for <strong>@{username}</strong>)
              </span>
            </div>

            {filteredRepos.length === 0 ? (
              <div className="empty-search-box panel">
                <p>
                  {repos.length === 0
                    ? `User @${username} has no public repositories.`
                    : `No repositories found matching "${searchQuery}".`}
                </p>
              </div>
            ) : (
              <>
                <div className="project-grid">
                  {paginatedRepos.map((repo) => (
                    <article key={repo.id} className="project-card">
                      <div className="project-head">
                        <h3>{repo.name}</h3>
                        <div className="project-head-meta">
                          <span className="star-badge" title="GitHub Stars">
                            ⭐ {repo.stargazers_count}
                          </span>
                          <a href={repo.html_url} target="_blank" rel="noreferrer">
                            GitHub ↗
                          </a>
                        </div>
                      </div>
                      <p className="project-stack">
                        {repo.language ? `Primary Language: ${repo.language}` : 'General / Docs'}
                      </p>
                      <p className="repo-desc">
                        {repo.description ? repo.description : 'No description provided for this repository.'}
                      </p>
                    </article>
                  ))}
                </div>

                {/* Pagination Controls when totalPages > 1 */}
                {totalPages > 1 && (
                  <div className="pagination-container">
                    <button
                      type="button"
                      className="pagination-btn nav-btn"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      ← Prev
                    </button>

                    <div className="page-numbers">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                        <button
                          key={pageNumber}
                          type="button"
                          className={`pagination-btn ${pageNumber === currentPage ? 'active' : ''}`}
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="pagination-btn nav-btn"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default Projects
