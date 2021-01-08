import { Channel, FeedType, MakeAggregateFeed, MakeFeed } from "./rss"
import makeGui from './gui'

const CORSproxies = [
    'http://149.28.237.160:8080/',
    'https://cors-anywhere.herokuapp.com/',
    'http://www.whateverorigin.org/get?url=',
    'http://dry-sierra-94326.herokuapp.com/',
    'https://thingproxy.freeboard.io/fetch/',
    'https://cors.now.sh/',
    'http://fuck-cors.com/?url=',
]

let channels: Channel[] = [
    MakeFeed('lukesmith.xyz', 'https://lukesmith.xyz/rss.xml'),
    MakeAggregateFeed('Videos', FeedType.Video, [
        MakeFeed('gamefromscratch', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCr-5TdGkKszdbboXXsFZJTQ'),
        MakeFeed('the art of code', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCcAlTqd9zID6aNX3TzwxJXg'),
        MakeFeed('meth squad', 'https://www.youtube.com/feeds/videos.xml?channel_id=UC8PqFD4Nqk4PbqvCwudmQww'),
        MakeFeed('jreg', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCGSGPehp0RWfca-kENgBJ9Q'),
        MakeFeed('mental outlaw', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCZEvYxVEr0MMUG2ZCpG8bRA'),
        MakeFeed('luke smith', 'https://videos.lukesmith.xyz/feeds/videos.xml?sort=-publishedAt&filter=local'),
        MakeFeed('low level javascript', 'https://www.youtube.com/feeds/videos.xml?channel_id=UC56l7uZA209tlPTVOJiJ8Tw'),
        MakeFeed('kittydog', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCx5HQPjpr3JAeBFKkar8E0A'),
        MakeFeed('cruffle', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCOdo9GU0enYmMD3shBfDF9g'),
        MakeFeed('vivzypop', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCzfyYtgvkx5mLy8nlLlayYg'),
        MakeFeed('cloy', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCBQAre4rMQmvpKN_-WY5uPQ'),
        MakeFeed('typh', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCdARcqAEmGmU9ppAx8KHiVQ'),
        MakeFeed('sr pelo', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCt-GOpCw4dOBlIyqL9A1ztA'),
        MakeFeed('context free', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCS4FAVeYW_IaZqAbqhlvxlA'),
        MakeFeed('hochelaga', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCjP-MiAEn9DPvUHNyGEs7Wg'),
        MakeFeed('GypsyCrusader', 'https://www.bitchute.com/feeds/rss/channel/Gypsycrusader/'),
        MakeFeed('gligar13', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCzozMcF1kcR9dzsdEkRHdaw'),
        MakeFeed('fireship', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCsBjURrPoezykLs9EqgamOA'),
        MakeFeed('aimkid', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCAPwJEqyypq9q895BD6DsqQ'),
    ]),
    MakeAggregateFeed('Hell', FeedType.MicroBlog, [
        MakeFeed('Designer_Ojisan', 'https://nitter.net/Designer_Ojisan/media/rss'),
        MakeFeed('Spareribs_777', 'https://nitter.net/Spareribs_777/media/rss'),
        MakeFeed('_OVOIP', 'https://nitter.net/_OVOIP/media/rss'),
        MakeFeed('yupo__0322', 'https://nitter.net/yupo__0322/media/rss'),
        MakeFeed('hirochanu0807', 'https://nitter.net/hirochanu0807/media/rss'),
        MakeFeed('shiroshio_ki', 'https://nitter.net/shiroshio_ki/media/rss'),
        MakeFeed('inukami_hikari', 'https://nitter.net/inukami_hikari/media/rss'),
        MakeFeed('NeveYk', 'https://nitter.net/NeveYk/media/rss'),
        MakeFeed('lipotes', 'https://nitter.net/lipotes/media/rss'),
        MakeFeed('chiro_poke', 'https://nitter.net/chiro_poke/media/rss'),
        MakeFeed('_Get_It_Go', 'https://nitter.net/_Get_It_Go/media/rss'),
        MakeFeed('racoonwolf', 'https://nitter.net/racoonwolf/media/rss'),
        MakeFeed('gutbiscuit', 'https://nitter.net/gutbiscuit/media/rss'),
        MakeFeed('mucknagabe', 'https://nitter.net/mucknagabe/media/rss'),
        MakeFeed('yamakikei_', 'https://nitter.net/yamakikei_/media/rss'),
        MakeFeed('awwchang', 'https://nitter.net/awwchang/media/rss'),
        MakeFeed('TheFFCollective', 'https://nitter.net/TheFFCollective/media/rss'),
        MakeFeed('iynxxe', 'https://nitter.net/iynxxe/media/rss'),
        MakeFeed('sifyro', 'https://nitter.net/sifyro/media/rss'),
        MakeFeed('AdvosArt', 'https://nitter.net/AdvosArt/media/rss'),
        MakeFeed('Ribbonfiddle', 'https://nitter.net/Ribbonfiddle/media/rss'),
        MakeFeed('verFyhi', 'https://nitter.net/verFyhi/media/rss'),
        MakeFeed('littucas', 'https://nitter.net/littucas/media/rss'),
        MakeFeed('ChikoritaMoon', 'https://nitter.net/ChikoritaMoon/media/rss'),
        MakeFeed('plattyneko', 'https://nitter.net/plattyneko/media/rss'),
        MakeFeed('ginja_K_ninja', 'https://nitter.net/ginja_K_ninja/media/rss'),
        MakeFeed('opryee', 'https://nitter.net/opryee/media/rss'),
        MakeFeed('Nakios_', 'https://nitter.net/Nakios_/media/rss')
    ])
]

// const s = document.querySelector('#sidebar')


makeGui({
    channels,
    layout: document.querySelector('#layout'),
    sidebar: document.getElementById('channel-list'),
    articleContainer: document.getElementById('articles'),
    menuBtn: document.querySelector('.menu-btn'),
    nextBtn: document.getElementById('btn-next') as HTMLButtonElement,
    prevBtn: document.getElementById('btn-previous') as HTMLButtonElement,
    updateBtn: document.querySelector('#update-channels'),
    updateProgress: document.querySelector('.progress'),
})

