import { ROOT_CONTAINER_ID, ROOT_CONTAINER_WRAPPER_ID } from '@/constants'

export const getAppRootElement = (): HTMLElement | undefined => {
  return document
    .querySelector(`#${ROOT_CONTAINER_ID}`)
    ?.shadowRoot?.querySelector(`#${ROOT_CONTAINER_WRAPPER_ID}`) as HTMLElement
}
