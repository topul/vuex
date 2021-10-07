import applyMixin from './mixin'
import { forEachValue, partial } from './util'
import ModuleCollection from './module/module-collection'

let Vue
class Store {
  constructor (options = {}) {
    const state = options.state
    // const getters = options.getters

    this._wrappedGetters = Object.create(null)
    this._modules = new ModuleCollection(options)

    installModule(this, state, [], this._modules.root)
    resetStoreVM(this, state)
  }

  get state () {
    return this._vm._data.$$state
  }
}

function installModule (store, rootState, path, module) {
  // const isRoot = !path.length
  const namespace = store._modules.getNamespace(path)

  const local = module.context = makeLocalContext(store, namespace, path)

  module.forEachGetter((getter, key) => {
    const namespacedType = namespace + key
    registerGetter(store, namespacedType, getter, local)
  })
}

function registerGetter (store, type, rawGetter, local) {
  if (store._wrappedGetters[type]) {
    return
  }
  store._wrappedGetters[type] = function wrappedGetter (store) {
    return rawGetter(
      local.state, // local state
      local.getters, // local getters
      store.state, // root state
      store.getters // root getters
    )
  }
}

function makeLocalContext (store, namespace, path) {
  const local = {
    dispatch: store.dispatch,

    commit: store.commit
  }

  // getters and state object must be gotten lazily
  // because they will be changed by vm update
  Object.defineProperties(local, {
    getters: {
      get: store.getters
    },
    state: {
      get: () => getNestedState(store.state, path)
    }
  })

  return local
}

function getNestedState (state, path) {
  return path.reduce((state, key) => state[key], state)
}

function resetStoreVM (store, state) {
  store.getters = {}
  const wrappedGetters = store._wrappedGetters
  const computed = {}
  forEachValue(wrappedGetters, (fn, key) => {
    computed[key] = partial(fn, store)
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true
    })
  })
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
}

function install (_Vue) {
  Vue = _Vue
  applyMixin(Vue)
}

export default {
  Store,
  install
}
export {
  Store,
  install
}
