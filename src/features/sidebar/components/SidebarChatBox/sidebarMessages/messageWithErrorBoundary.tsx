import React, { Component, ComponentType } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
}

export const messageWithErrorBoundary = <P extends object>(
  WrappedComponent: ComponentType<P>,
) => {
  return class ErrorBoundary extends Component<P, ErrorBoundaryState> {
    constructor(props: P) {
      super(props)
      this.state = { hasError: false }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      // 处理错误，例如记录错误信息
      console.error('simply componentDidCatch error', error, errorInfo)
      // 更新状态以渲染降级的 UI
      this.setState({ hasError: true })
    }

    render() {
      if (this.state.hasError) {
        // 渲染降级的 UI
        return <WrappedComponent {...this.props} liteMode hasError />
      }
      return <WrappedComponent {...this.props} />
    }
  }
}
export default messageWithErrorBoundary
