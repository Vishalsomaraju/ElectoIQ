// src/context/AppContext.jsx
import { createContext, useContext, useReducer } from 'react'
import { SUGGESTED_QUESTIONS } from '../constants'

const initialState = {
  currentPage: 'home',
  quizState: {
    started: false,
    currentIndex: 0,
    answers: {},
    completed: false,
    score: 0,
  },
  progress: {
    timelineViewed: [],
    glossaryViewed: [],
    quizzesCompleted: 0,
    totalScore: 0,
  },
  chatOpen: false,
  chatContext: null, // Stores specific context like { stageName: 'Voting' }
  suggestedQuestions: SUGGESTED_QUESTIONS.HOME,
}

/**
 * Reducer function for global app state.
 * @param {Object} state - Current application state
 * @param {Object} action - Dispatched action object
 * @returns {Object} Updated state
 */
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload }

    case 'START_QUIZ':
      return { ...state, quizState: { ...initialState.quizState, started: true } }

    case 'ANSWER_QUESTION':
      return {
        ...state,
        quizState: {
          ...state.quizState,
          answers: { ...state.quizState.answers, [action.payload.index]: action.payload.answer },
        },
      }

    case 'NEXT_QUESTION':
      return {
        ...state,
        quizState: { ...state.quizState, currentIndex: state.quizState.currentIndex + 1 },
      }

    case 'COMPLETE_QUIZ':
      return {
        ...state,
        quizState: { ...state.quizState, completed: true, score: action.payload.score },
        progress: {
          ...state.progress,
          quizzesCompleted: state.progress.quizzesCompleted + 1,
          totalScore: state.progress.totalScore + action.payload.score,
        },
      }

    case 'RESET_QUIZ':
      return { ...state, quizState: initialState.quizState }

    case 'MARK_TIMELINE_VIEWED':
      return {
        ...state,
        progress: {
          ...state.progress,
          timelineViewed: [...new Set([...state.progress.timelineViewed, action.payload])],
        },
      }

    case 'MARK_GLOSSARY_VIEWED':
      return {
        ...state,
        progress: {
          ...state.progress,
          glossaryViewed: [...new Set([...state.progress.glossaryViewed, action.payload])],
        },
      }

    case 'TOGGLE_CHAT':
      return { 
        ...state, 
        chatOpen: action.payload !== undefined ? action.payload : !state.chatOpen 
      }
      
    case 'SET_CHAT_CONTEXT':
      return {
        ...state,
        chatContext: action.payload
      }
      
    case 'SET_SUGGESTED_QUESTIONS':
      return {
        ...state,
        suggestedQuestions: action.payload
      }

    default:
      return state
  }
}

const AppContext = createContext(null)

/**
 * Provider component for global application context.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Context provider
 */
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

/**
 * Custom hook to access application context.
 * @returns {Object} App state and dispatch method
 * @throws {Error} If used outside of AppProvider
 */
export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
