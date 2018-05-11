<template>
    <section class="view-base">


        <main>
            <router-view></router-view>
        </main>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {RouteNames} from '../vue/Routing'

    export default {
        data(){ return {
            mobileMode:window.innerWidth <= 760
        }},
        computed: {
            ...mapState([

            ])
        },
        methods: {
            ...mapActions([

            ])
        }
    }
</script>

<style lang="scss">
    .view-base {

        main {

        }

    }
</style>