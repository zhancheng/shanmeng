import Vue from 'vue'
// import Common from 'assets/js/layout'
import Index from './searchResult.vue'
import VueResource from 'vue-resource'

Vue.use(VueResource)

new Vue({
    el: '#search-page',
    render: h => h(Index)
})
