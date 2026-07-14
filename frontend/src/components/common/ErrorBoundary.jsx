import { Component } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation, faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons'
import './ErrorBoundary.css'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Logged to console for now — swap for a real error-tracking service later
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="eb__wrap">
          <FontAwesomeIcon icon={faTriangleExclamation} className="eb__icon" />
          <h2 className="eb__title">Something went wrong</h2>
          <p className="eb__msg">
            This part of the page hit an unexpected error. You can try again, or head back home.
          </p>
          <div className="eb__actions">
            <button className="eb__retry" onClick={() => this.setState({ hasError: false, error: null })}>
              <FontAwesomeIcon icon={faArrowRotateLeft} /> Try again
            </button>
            <Link to="/" className="eb__home">Go home</Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}