import { forEachValue } from '../util'

export default class Module {
  constructor (rawModule, runtime) {
    this.runtime = runtime
    // 存储一些子项目
    this._children = Object.create(null)
    // 存储用户传入的初始模块对象
    this._rawModule = rawModule
    const rawState = rawModule.state

    this.state = rawState || {}
  }

  addChild (key, module) {
    this._children[key] = module
  }

  forEachGetter (fn) {
    if (this._rawModule.getters) {
      forEachValue(this._rawModule.getters, fn)
    }
  }
}
