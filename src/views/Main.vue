<style lang="less">
    @import "./main.less";
</style>
<template>
    <div class="main" :class="{'main-hide-text': hideMenuText}">
        <div class="sidebar-menu-con" :style="{width: hideMenuText?'60px':'200px', overflow: hideMenuText ? 'visible' : 'auto', background: $store.state.menuTheme === 'dark'?'#495060':'white'}">
            <div class="logo-con">
                <img v-show="!hideMenuText"  src="http://store-images.s-microsoft.com/image/apps.49921.9007199266277724.233bf676-4a55-4742-83ad-464a288184a9.6e494c51-95e4-4047-b0ad-28566ed6c0ed" key="max-logo" />
                <img v-show="hideMenuText" src="http://store-images.s-microsoft.com/image/apps.49921.9007199266277724.233bf676-4a55-4742-83ad-464a288184a9.6e494c51-95e4-4047-b0ad-28566ed6c0ed" key="min-logo" />
            </div>
            <sidebar-menu v-if="!hideMenuText" :menuList="menuList" :iconSize="14"/>
            <sidebar-menu-shrink :icon-color="menuIconColor" v-else :menuList="menuList"/>
        </div>
        <div class="main-header-con" :style="{paddingLeft: hideMenuText?'60px':'200px'}">
            <div class="main-header">
                <div class="navicon-con">
                    <Button :style="{transform: 'rotateZ(' + (this.hideMenuText ? '-90' : '0') + 'deg)'}" type="text" @click="toggleClick">
                        <Icon type="navicon" size="32"></Icon>
                    </Button>
                </div>
                <div class="header-middle-con">
                    <div class="main-breadcrumb">
                        <breadcrumb-nav :currentPath="currentPath"></breadcrumb-nav>
                    </div>
                </div>
                <div class="header-avator-con">
                    <div @click="handleFullScreen" v-if="showFullScreenBtn" class="full-screen-btn-con">
                        <Tooltip :content="isFullScreen ? 'Exit Full Screen' : 'Full screen'" placement="bottom">
                            <Icon :type="isFullScreen ? 'arrow-shrink' : 'arrow-expand'" :size="23"></Icon>
                        </Tooltip>
                    </div>
                    <div @click="lockScreen" class="lock-screen-btn-con">
                        <Tooltip content="Lock screen" placement="bottom">
                            <Icon type="locked" :size="20"></Icon>
                        </Tooltip>
                    </div>
                    <div @click="showMessage" class="message-con">
                        <Tooltip :content="messageCount > 0 ? 'Have' + messageCount + 'Unread messages' : 'No unread messages'" placement="bottom">
                            <Badge :count="messageCount" dot>
                                <Icon type="ios-bell" :size="22"></Icon>
                            </Badge>
                        </Tooltip>
                    </div>
                    <div class="switch-theme-con">
                        <Row class="switch-theme" type="flex" justify="center" align="middle">
                            <theme-dropdown-menu></theme-dropdown-menu>
                        </Row>
                    </div>
                    <div class="user-dropdown-menu-con">
                        <Row type="flex" justify="end" align="middle" class="user-dropdown-innercon">
                            <Dropdown transfer trigger="click" @on-click="handleClickUserDropdown">
                                <a href="javascript:void(0)">
                                    <span class="main-user-name">{{ userName }}</span>
                                    <Icon type="arrow-down-b"></Icon>
                                </a>
                                <DropdownMenu slot="list">
                                    <DropdownItem name="ownSpace">Personal center</DropdownItem>
                                    <DropdownItem name="loginout" divided>Sign out</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                            <Avatar :src="avatorPath" style="margin-left: 10px;"></Avatar>
                        </Row>
                    </div>
                </div>
            </div>
            <div class="tags-con">
                <tags-page-opened :pageTagsList="pageTagsList"></tags-page-opened>
            </div>
        </div>
        <div class="single-page-con" :style="{left: hideMenuText?'60px':'200px'}">
            <div class="single-page">
                <keep-alive :include="cachePage">
                    <router-view></router-view>
                </keep-alive>
            </div>
        </div>
    </div>
</template>
<script>
    import sidebarMenu from './main_components/sidebarMenu.vue';
    import tagsPageOpened from './main_components/tagsPageOpened.vue';
    import breadcrumbNav from './main_components/breadcrumbNav.vue';
    import themeDropdownMenu from './main_components/themeDropdownMenu.vue';
    import sidebarMenuShrink from './main_components/sidebarMenuShrink.vue';
    import commonHelper from '@/libs/helpers/common.helper';
    import Cookies from 'js-cookie';
    import util from '@/libs/util.js';
    import { mapGetters } from 'vuex'
    
    export default {
        components: {
            sidebarMenu,
            tagsPageOpened,
            breadcrumbNav,
            themeDropdownMenu,
            sidebarMenuShrink
        },
        data () {
            return {
                spanLeft: 4,
                spanRight: 20,
                currentPageName: '',
                hideMenuText: false,
                userName: '',
                showFullScreenBtn: window.navigator.userAgent.indexOf('MSIE') < 0,
                messageCount: 0,
                lockScreenSize: 0
            };
        },
        computed: {
            menuList () {
                return this.$store.state.menuList;
            },
            tagsList () {
                return this.$store.state.tagsList;  // Page object for all pages
            },
            pageTagsList () {
                return this.$store.state.pageOpenedList;  // Page object of the opened page
            },
            currentPath () {
                return this.$store.state.currentPath;  // Current breadcrumb array
            },
            menuIconColor () {
                return this.$store.state.menuTheme === 'dark' ? 'white' : '#495060';
            },
            avatorPath () {
                return localStorage.avatorImgPath;
            },
            cachePage () {
                return this.$store.state.cachePage;
            },
            lang () {
                return this.$store.state.lang;
            },
            isFullScreen () {
                return this.$store.state.isFullScreen;
            },
            // ...mapGetters(['isAuthenticated'])
        },
        methods: {
            init () {
                this.$store.commit('setCurrentPageName', this.$route.name);
                let pathArr = util.setCurrentPath(this, this.$route.name);
                if (pathArr.length >= 2) {
                    this.$store.commit('addOpenSubmenu', pathArr[1].name);
                }
                this.userName = Cookies.get('user');
                let messageCount = 3;
                this.messageCount = messageCount.toString();
                this.checkTag(this.$route.name);
            },
            toggleClick () {
                this.hideMenuText = !this.hideMenuText;
            },
            handleClickUserDropdown (name) {
                if (name === 'ownSpace') {
                    util.openNewPage(this, 'ownspace_index');
                    this.$router.push({
                        name: 'ownspace_index'
                    });
                } else if (name === 'loginout') {
                    this.$store.dispatch('logout').then((response) => {
                        this.$Notice.close('greeting');
                        this.$store.commit('clearOpenedSubmenu');
                        // Reply to the default style
                        let themeLink = document.querySelector('link[name="theme"]');
                        themeLink.setAttribute('href', '');
                        this.$router.push({
                        name: 'login'
                        });
                    }).catch((error)=>{
                        this.$Notice.error({
                            title: 'Authentication',
                            desc: error.message,
                        });
                    })
                }
            },
            handleFullScreen () {
                this.$store.commit('handleFullScreen');
                // this.$store.commit('changeFullScreenState');
            },
            showMessage () {
                util.openNewPage(this, 'message_index');
                this.$router.push({
                    name: 'message_index'
                });
            },
            lockScreen () {
                let lockScreenBack = document.getElementById('lock_screen_back');
                lockScreenBack.style.transition = 'all 3s';
                lockScreenBack.style.zIndex = 10000;
                lockScreenBack.style.boxShadow = '0 0 0 ' + this.lockScreenSize + 'px #667aa6 inset';
                this.showUnlock = true;
                this.$store.commit('lock');
                Cookies.set('last_page_name', this.$route.name); // The page that was opened before the local storage lock screen opens to unlock it
                setTimeout(() => {
                    lockScreenBack.style.transition = 'all 0s';
                    this.$router.push({
                        name: 'locking'
                    });
                }, 800);
            },
            checkTag (name) {
                let openpageHasTag = this.pageTagsList.some(item => {
                    if (item.name === name) {
                        return true;
                    }
                });
                if (!openpageHasTag) {  //  Solve the closure of the current tab and then click the Back button will return to the current page no label problem
                    util.openNewPage(this, name, this.$route.params || {}, this.$route.query || {});
                }
            }
        },
        watch: {
            '$route' (to) {
                this.$store.commit('setCurrentPageName', to.name);
                let pathArr = util.setCurrentPath(this, to.name);
                if (pathArr.length > 2) {
                    this.$store.commit('addOpenSubmenu', pathArr[1].name);
                }
                this.checkTag(to.name);
            },
            lang () {
                util.setCurrentPath(this, this.$route.name);  // Used to refresh the breadcrumbs when switching languages
            }
        },
        mounted () {
            this.init();
            // Lock screen related
            let lockScreenBack = document.getElementById('lock_screen_back');
            let x = document.body.clientWidth;
            let y = document.body.clientHeight;
            let r = Math.sqrt(x * x + y * y);
            let size = parseInt(r);
            this.lockScreenSize = size;
            window.addEventListener('resize', () => {
                let x = document.body.clientWidth;
                let y = document.body.clientHeight;
                let r = Math.sqrt(x * x + y * y);
                let size = parseInt(r);
                this.lockScreenSize = size;
                lockScreenBack.style.transition = 'all 0s';
                lockScreenBack.style.width = lockScreenBack.style.height = size + 'px';
            });
            lockScreenBack.style.width = lockScreenBack.style.height = size + 'px';
            // Greetings related
            if (!Cookies.get('hasGreet')) {
                let now = new Date();
                let hour = now.getHours();
                let greetingWord = {
                    title: '',
                    words: ''
                };
                let userName = '';  // have to add the username from the store
                if (hour > 5 && hour < 6) {
                    greetingWord = {title: 'Good morning ' + userName, words: 'Early bird gets the worm~'};
                } else if (hour >= 6 && hour < 9) {
                    greetingWord = {title: 'Good morning ' + userName, words: 'Have a cup of coffee and start a good day~'};
                } else if (hour >= 9 && hour < 12) {
                    greetingWord = {title: 'Good morning' + userName, words: 'Work to be cheered~'};
                } else if (hour >= 12 && hour < 14) {
                    greetingWord = {title: 'Good afternoon~' + userName, words: 'To eat full lunch~'};
                } else if (hour >= 14 && hour < 17) {
                    greetingWord = {title: 'Good afternoon~' + userName, words: 'Afternoon also full of vitality~'};
                } else if (hour >= 17 && hour < 19) {
                    greetingWord = {title: 'Good evening~' + userName, words: 'Greetings from parents next to work under the parents~'};
                } else if (hour >= 19 && hour < 21) {
                    greetingWord = {title: 'Good evening~' + userName, words: 'A copy of the work of a product of incense bar ~'};
                } else {
                    greetingWord = {title: 'Good night~' + userName, words: 'Late at night, pay attention to rest Oh ~'};
                }
                this.$Notice.config({
                    top: 130
                });
                this.$Notice.info({
                    title: greetingWord.title,
                    desc: greetingWord.words,
                    duration: 4,
                    name: 'greeting'
                });
                Cookies.set('hasGreet', 1);
            }
        },
        created () {
            // Find the current user's login settings before the theme
            let name = Cookies.get('user');
            if (localStorage.theme) {
                let hasThisUser = JSON.parse(localStorage.theme).some(item => {
                    if (item.userName === name) {
                        this.$store.commit('changeMenuTheme', item.menuTheme);
                        this.$store.commit('changeMainTheme', item.mainTheme);
                        return true;
                    } else {
                        return false;
                    }
                });
                if (!hasThisUser) {
                    this.$store.commit('changeMenuTheme', 'dark');
                    this.$store.commit('changeMainTheme', 'b');
                }
            } else {
                this.$store.commit('changeMenuTheme', 'dark');
                this.$store.commit('changeMainTheme', 'b');
            }
            // Set theme according to user
            if (this.$store.state.theme !== 'b') {
                let stylesheetPath = '../../dist/' + this.$store.state.theme + '.css';
                let themeLink = document.querySelector('link[name="theme"]');
                themeLink.setAttribute('href', stylesheetPath);
            }
            // Display a list of open pages
            this.$store.commit('setOpenedList');
        }
    };
</script>
