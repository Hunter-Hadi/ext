import {
  IContextMenuItem,
  IContextMenuItemWithChildren,
} from '@/features/contextMenu/types'

type IPathItem = {
  item: IContextMenuItem
  siblingList: IContextMenuItem[]
  triggerByHover: boolean
}

export default class TreeNavigatorMatcher {
  private _menuList: IContextMenuItem[] = []
  private _path: IPathItem[] = []
  private _onUpdate = () => {}

  set onUpdate(callback: VoidFunction) {
    this._onUpdate = callback
  }

  get path(): IPathItem[] {
    return this._path
  }

  updatePath(newValue: IPathItem[]) {
    this._path = newValue

    this._onUpdate()
  }

  set menuList(list: IContextMenuItem[]) {
    if (list === this._menuList) return
    this._menuList = list
    if (this._menuList.length === 0) {
      this.updatePath([])
    } else {
      this.updatePath([
        {
          item: this._menuList[0],
          siblingList: this._menuList,
          triggerByHover: false,
        },
      ])
    }
  }

  setHoverItem(item: IContextMenuItem) {
    const path: IPathItem[] = []

    function dfs(menuList: IContextMenuItem[]) {
      const siblingList = menuList
      for (const menuItem of menuList) {
        if (menuItem == item) {
          path.unshift({ item: menuItem, siblingList, triggerByHover: true })
          return true
        } else if (menuItem.data.type === 'group') {
          if (dfs((menuItem as IContextMenuItemWithChildren).children || [])) {
            path.unshift({ item: menuItem, siblingList, triggerByHover: true })
          }
        }
      }

      return false
    }
    dfs(this._menuList)

    this.updatePath(path)
  }

  onNavigate(direction: 'Up' | 'Left' | 'Right' | 'Down') {
    if (this.path.length === 0) return false
    const lastLevel = this.path[this.path.length - 1]

    switch (direction) {
      case 'Up': {
        const index = lastLevel.siblingList.indexOf(lastLevel.item)
        if (index === -1) {
          throw Error('onNavigate up index = -1')
        }
        if (index === 0) {
          return false
        }
        lastLevel.item = lastLevel.siblingList[index - 1]
        this.updatePath(
          this.path.map((item) => ({ ...item, triggerByHover: false })),
        )
        return true
      }
      case 'Down': {
        const index = lastLevel.siblingList.indexOf(lastLevel.item)
        if (index === -1) {
          throw Error('onNavigate down index = -1')
        }
        if (index === lastLevel.siblingList.length - 1) {
          return false
        }
        lastLevel.item = lastLevel.siblingList[index + 1]
        this.updatePath(
          this.path.map((item) => ({ ...item, triggerByHover: false })),
        )
        return true
      }
      case 'Left': {
        if (this._path.length === 1) {
          return false
        }
        this.updatePath(
          this.path
            .slice(0, this._path.length - 1)
            .map((item) => ({ ...item, triggerByHover: false })),
        )
        return true
      }
      case 'Right': {
        if (lastLevel.item.data.type !== 'group') {
          return false
        }
        const currentItem: IContextMenuItemWithChildren = lastLevel.item as any
        if (!currentItem.children || currentItem.children.length === 0) {
          return false
        }

        this.path.push({
          item: currentItem.children[0],
          siblingList: currentItem.children,
          triggerByHover: false,
        })

        this.updatePath(
          this.path.map((item) => ({ ...item, triggerByHover: false })),
        )
        return true
      }
    }
  }

  /**
   * 查找当前是否在路径上
   */
  match(item: IContextMenuItem, level?: number): IPathItem | undefined {
    if (level !== undefined && item === this._path[level - 1].item) {
      return this._path[level - 1]
    }

    return this._path.find((record) => record.item === item)
  }

  matchOpenGroup(item: IContextMenuItem) {
    const index = this._path.findIndex((record) => record.item === item)
    if (index === -1) return false
    return index !== this._path.length - 1 || this.path[index].triggerByHover
  }
}
