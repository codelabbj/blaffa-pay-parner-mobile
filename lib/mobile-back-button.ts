export class MobileBackButtonHandler {
  private static instance: MobileBackButtonHandler
  private isInitialized = false
  private backButtonCallback?: () => void
  private eventListeners: Array<{ element: EventTarget; event: string; handler: EventListener }> = []

  private constructor() {}

  static getInstance(): MobileBackButtonHandler {
    if (!MobileBackButtonHandler.instance) {
      MobileBackButtonHandler.instance = new MobileBackButtonHandler()
    }
    return MobileBackButtonHandler.instance
  }

  initialize(callback: () => void) {
    if (this.isInitialized) return

    this.backButtonCallback = callback

    const handleBackButton = () => {
      if (this.backButtonCallback) {
        this.backButtonCallback()
      }
    }

    // Listen for various back button events
    const events = [
      { element: document, event: 'backbutton', handler: (e: Event) => { e.preventDefault(); handleBackButton() } },
      { element: window, event: 'backbutton', handler: (e: Event) => { e.preventDefault(); handleBackButton() } },
      { element: window, event: 'popstate', handler: (e: Event) => { e.preventDefault(); handleBackButton() } },
      { element: window, event: 'mobileBackButton', handler: handleBackButton }
    ]

    // Add all event listeners
    events.forEach(({ element, event, handler }) => {
      element.addEventListener(event, handler, false)
      this.eventListeners.push({ element, event, handler })
    })

    this.isInitialized = true
    console.log('Mobile back button handler initialized with', events.length, 'event listeners')
  }

  setCallback(callback: () => void) {
    this.backButtonCallback = callback
  }

  cleanup() {
    if (this.isInitialized) {
      // Remove all event listeners
      this.eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler)
      })
      
      this.eventListeners = []
      this.isInitialized = false
      console.log('Mobile back button handler cleaned up')
    }
  }
}

export const mobileBackButtonHandler = MobileBackButtonHandler.getInstance()
