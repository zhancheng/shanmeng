<template>
    <div class="search-result-wrapper">
        <template v-if="!isEmpty">
            <!-- 表情包模块 -->
            <div v-if="emoList.length > 0" class="pack-mod border-1px" v-for="item in emoList" @click="goPack(item)">
                <p class="name">{{item.name}}<span>{{item.count}}P</span></p>
                <p class="summary">{{item.summary}}</p>
                <ul>
                    <li v-for="img in item.img"><img :src="blank" :data-echo="img"></li>
                </ul>
            </div>
            <!-- 最热推荐 -->
            <div v-if="hotList.length > 0" class="hot-mod border-1px-t">
                <h3><em></em>最热推荐</h3>
                <div v-for="arr in hotList" class="row">
                    <p v-for="item in arr" @click="goDetail(item)">
                        <span><img :src="blank" :data-echo="item.url" v-middle="item"></span>
                    </p>
                </div>
            </div>
            <!-- 最近更新 -->
            <div  v-if="searchList.length > 0" class="latest-mod">
                <h3><em></em>最近更新</h3>
                <div v-for="arr in searchList" class="row">
                    <p v-for="item in arr" @click="goDetail(item)">
                        <span><img :src="blank" :data-echo="item.url" v-middle="item"></span>
                    </p>
                </div>
            </div>
            <div v-if="loading" class="loading"><em></em>正在加载更多的数据...</div>
            <div v-if="noMore" class="no-more">已经全部加载完毕</div>
        </template>
        <template v-if="isEmpty && hasRequest">
            <div class="no-result">
                <div class="sug-tip">
                    <em></em>
                    <h4>暂无结果</h4>
                    <p>建议您换个词搜索一下或试试我们的搜索建议</p>
                </div>
                <div class="sug-rec">
                    <p><em></em>搜索建议</p>
                    <ul>
                        <li v-for="keyword in sugList" @click="reSearch(keyword)">
                            {{keyword}}
                        </li>
                    </ul>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import util from 'assets/js/util'
import lazyload from 'assets/js/lazyload'

export default {
    name: 'search-result',
    data () {
        return {
            keyword: util.getUrlParam('keyword'),
            // 表情包列表
            emoList: [],
            // 热门推荐列表
            hotList: [],
            // 搜索结果 最近更新列表
            searchList: [],
            // 推荐关键词
            sugList: [],
            // 是否已经请求过搜索结果
            hasRequest: false,
            // 当前是否正在加载数据
            loading: false,
            // 当前页数
            pageNo: 1,
            // 每页展示数目
            pageCount: 30,
            // 请求的起始数
            offset: 0,
            // 设置滚动到距离底部多少时触发翻页 默认100px
            scrollLimit: 100,
            // 滚动锁  当触发请求时将不再允许触发下次请求
            scrollLock: true,
            // 是否无结果
            isEmpty: 0,
            // 客户端信息
            nativeInfo: null,
            // blank.gif
            blank: require('assets/img/blank.gif'),
            // debug
            debug: Boolean(util.getUrlParam('debug')) || false
        }
    },
    directives: {
        middle(el, binding, vnode){
            setTimeout(function(){
                var val = binding.value;
                var wh = el.parentNode.offsetWidth;
                if(val.w > val.h){
                    el.style.marginLeft = - Math.ceil((val.w - val.h)/val.h/2 * 100) + '%'
                    el.style.height = wh + 'px';
                }else{
                    el.style.marginTop = - Math.ceil((val.h - val.w)/val.w/2 * 100) + '%'
                    el.style.width = wh + 'px';
                }
            },0)
        }
    },
    created(){
        this.getNativeInfo();
        if(this.debug){
            setTimeout(function(){
                getNativeInfo({
                  "s":"iOS", //系统
                  "sv":"10.2", //系统版本
                  "v":"1.16.1", //APP版本号
                  "lan":"zh-Hans",//语言
                  "h":"4a800a419d4f43a9b272dab8d7c09ad0", //机器码
                  "autoplay":"1", //图片是否自动播放
                  "starttimestamp":"1482895818", //启动时间
                  "netstatus":"1", //网络状态
                  "timestamp":"1482895819", //时间戳
                  "sign":"7e879fe48ba7e634fbd3f757e287b303" //签名
                })
            },1000)
        }
    },
    mounted(){
        this.bindEvent();
    },
    updated(){
        this.initLazyload();
    },
    watch: {
        // 所有的接口请求都要在客户端信息准备就绪后发送
        nativeInfo(){
            this.getPackAndHot();
            this.getSearchList();
        }
    },
    methods: {
        getNativeInfo(){
            var _this = this;
            window.getNativeInfo = function(info){
                _this.nativeInfo = info;
            }
            if(!this.debug){
                util.callClientInterface('showCallback', {
                    name: 'getNativeInfo'
                });
            }
        },
        initLazyload(){
            lazyload.init({
                wrapper: document.querySelector('.search-result-wrapper'),
                offset: 200
            });
        },
        // 获取表情包和最热数据
        getPackAndHot(){
            var _this = this;
            this.$http.jsonp('https://api.weshine.im/v2.0/search', {
                params: {
                    s: this.nativeInfo.s,
                    sv: this.nativeInfo.sv,
                    v: this.nativeInfo.v,
                    h: this.nativeInfo.h,
                    timestamp: this.nativeInfo.timestamp,
                    sign: this.nativeInfo.sign,
                    keyword: this.keyword,
                    block: 'hot'
                }
            }).then((res) => {
                var data = JSON.parse(res.data);
                if(data.meta.status === 200){
                    _this.emoList = data.data.emolist;
                    _this.hotList = _this.format(data.data.hot);
                    _this.hasRequest = true;
                    _this.isEmpty = (_this.emoList.length == 0 &&  _this.hotList.length ==0);
                    // _this.totalCount = data.pagination.totalCount;
                }
            })
        },
        getSearchList(){
            var _this = this;
            this.loading = true;
            this.$http.jsonp('https://api.weshine.im/v2.0/search', {
                params: {
                    s: this.nativeInfo.s,
                    sv: this.nativeInfo.sv,
                    v: this.nativeInfo.v,
                    h: this.nativeInfo.h,
                    timestamp: this.nativeInfo.timestamp,
                    sign: this.nativeInfo.sign,
                    keyword: this.keyword,
                    block: 'list',
                    // offset: (this.pageNo - 1) * this.pageCount,
                    offset: this.offset,
                    limit: this.pageCount
                }
            }).then((res) => {
                var data = JSON.parse(res.data);
                if(data.meta.status === 200){
                    _this.searchList = _this.searchList.concat(_this.format(data.data));
                    _this.offset = data.pagination.offset;
                    _this.scrollLock = true;
                    _this.loading = false;
                    // 如果没有查询结果
                    if(data.pagination.totalCount === 0){
                        _this.sugList = data.hotkeywords;
                    }
                    // 最后一页不再允许滑动请求
                    if(_this.pageNo === data.pagination.totalPage){
                        _this.scrollLock = false;
                        _this.noMore = true;
                    }

                }
            })
        },
        reSearch(keyword){
            this.keyword = keyword;

            util.ping({
                f: 'noresultpage',
                fv: 'hotwords',
                kw: keyword,
                h: this.nativeInfo.h,
                s: this.nativeInfo.s,
                v: this.nativeInfo.v,
            })

            this.getPackAndHot();
            this.getSearchList();
        },
        format(arr){
            var newArr = [];
            // 如果不能被三整除  需要把数组扩充到能被整除
            if(arr.length % 3 !== 0){
                var splitArr = [];
                var len = (3 - (arr.length % 3));
                for(var i=0; i<len; i++){
                    splitArr.push({});
                }
                arr = arr.concat(splitArr);
            }

            arr.forEach((item, index) => {
                var idx = Math.floor(index / 3);
                if(!newArr[idx]){
                    newArr[idx] = [];
                }
                newArr[idx].push(item);
            })

            return newArr;
        },
        goDetail(item){
            util.ping({
                f: 'searchresultlist',
                fv: this.keyword,
                h: this.nativeInfo.h,
                s: this.nativeInfo.s,
                uid: item.id,
                v: this.nativeInfo.v,
            })
            if(Number(item.isvideo) === 1){
                util.callClientInterface('showWeb', {
                    url: 'http://h5.weshineapp.com/detail-v.html?is_video=1&id=' + item.id,
                    name:'视频'
                });
            }else{
                util.callClientInterface('showImageDetail', {
                    id: item.id
                });
            }
        },
        goPack(item){
            util.ping({
                f: 'searchresultlist',
                fv: this.keyword,
                h: this.nativeInfo.h,
                s: this.nativeInfo.s,
                uid: item.id,
                v: this.nativeInfo.v,
            })
            util.callClientInterface('showEmoticonPackage', {
                id: item.id,
                name: item.name
            });
        },
        showImg(event){
            event.target.style.display = 'block';
        },
        bindEvent(){
            var _this = this;
            var dom = document.querySelector('.search-result-wrapper');
            dom.addEventListener('scroll', function(e){
                if(dom.scrollTop + dom.offsetHeight >= (dom.scrollHeight -  _this.scrollLimit)){
                    if(_this.scrollLock){
                        _this.pageNo = _this.pageNo + 1;
                        _this.scrollLock = false;
                        _this.getSearchList();
                    }
                }
            })
        }
    }
}
</script>

<style lang="less" scoped>
@main-color: #FFDA44;
@ft-color: #666;

.title(){
    height: 0.45rem;
    line-height: 0.48rem;
    position: relative;
    text-indent: 0.09rem;
    em{
        position: absolute;
        left: 0;
        top: 0.15rem;
        background: @main-color;
        width: 0.08rem;
        height: 0.2rem;
    }
}

.search-result-wrapper{
    -webkit-overflow-scrolling: touch;
    position: absolute;
    overflow: auto;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    font-size: 0.14rem;
    background: #f4f4f4;
    .loading, .no-more{
        line-height: 0.45rem;
        text-align: center;
        background: #fff;
        color: @ft-color;
        font-size: 0.14rem;
        em{
            display: inline-block;
            height: 0.14rem;
            width: 0.14rem;
            vertical-align: middle;
            background: url(./img/loading.gif);
            background-size: 100% 100%;
            margin-right: 0.05rem;
        }
    }
    .no-result{
        background: #fff;
        height: 100%;
        overflow: hidden;
        .sug-tip{
            margin: 0.5rem;
            h4{
                line-height: .25rem;
                font-size: 0.18rem;
            }
            p{
                font-size: 0.14rem;
                color: #888;
                line-height: 1.5;
            }
            em{
                float: left;
                height: 0.72rem;
                width: 0.67rem;
                background: url(./img/noresult.png);
                background-size: 100% 100%;
                margin-right: 0.18rem;
            }
        }
        .sug-rec{
            margin: 0 0.5rem;
            background: #f4f4f4;
            border-radius: 0.05rem;
            padding: 0.15rem 0;
            p{
                text-align: center;
                color: #ccc;
                em{
                    display: inline-block;
                    background: url(./img/search.png);
                    background-size: 100% 100%;
                    margin-right: 0.05rem;
                    height: 0.16rem;
                    width: 0.16rem;
                    vertical-align: middle;
                }
            }
            ul{
                padding-top: 0.15rem;
                li{
                    font-size: 0.16rem;
                    line-height: 2;
                    text-align: center;
                }
            }
        }
    }
    .pack-mod{
        margin: 0.15rem;
        background: #fff;
        overflow: hidden;
        position: relative;
        cursor: pointer;
        .name{
            padding: 0.15rem 0.15rem 0.1rem;
            span{
                color: @main-color;
                margin-top: -0.08rem;
                display: inline-block;
                vertical-align: middle;
                margin-left: 0.02rem;
                font-size: 0.12rem;
            }
        }
        .summary{
            padding: 0 0.15rem 0.15rem;
            font-size: 0.12rem;
            color: #9b9b9b;
            line-height: 1.5;
        }
        ul{
            padding: 0 0.15rem 0.15rem;
            height: 0.5rem;
            white-space: nowrap;
            li{
                display: inline-block;
                margin-right: 0.1rem;
                img{
                    height: 0.5rem;
                    width: 0.5rem;
                    // display: none;
                }
            }
        }
    }
    .hot-mod{
        h3{
            .title()
        }
        background: #fff;
        position: relative;
    }
    .latest-mod{
        h3{
            .title()
        }
        background: #fff;
        position: relative;
    }
    // 格子系统
    .row{
        display: -webkit-box;
        -webkit-box-align: center;
        p{
            -webkit-box-flex: 1.0;
            width: 0.1rem;
            padding: 0.03rem;
            &:first-child{
                padding-left: 0.06rem;
            }
            &:last-child{
                padding-right: 0.06rem;
            }
            span{
                display: block;
                width: 100%;
                padding-bottom: 100%;
                height: 0;
                overflow: hidden;
                background: #fbfbfb;
            }
            img{
                // display: none;
            }
        }
    }
}
</style>
