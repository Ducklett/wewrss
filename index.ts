import { AggregateFeedType, Channel, Feed, loadChannels, MakeAggregateFeed, MakeFeed, parseRss, RssArticle, saveChannels, updateFeeds } from "./rss"
import { Article, Button, Div, H2, Img, Main, Small, Summary, A, Details } from './domfluid'

let channels: Channel[] = []

const channelList = document.createElement('div')
channelList.id = 'channel-list'

const populateChannelList = (channels: Channel[]): HTMLElement => {
    channelList.innerHTML = null

    const buttons = channels.map((c, i) =>
        Button({
            text: c.name,
            class: 'channel-button',
            onClick: () => console.log(`${i} ${c.name}`),
        })
    )

    for (let b of buttons) channelList.appendChild(b)

    return channelList
}

const showArticles = (articles: RssArticle[]) => {
    const articleContainer = document.querySelector('#articles')
    articleContainer.innerHTML = null

    for (let ar of articles) {
        articleContainer.appendChild(Article({},
            A({}, H2({ text: ar.title })),
            Small({ text: ar.date.toDateString() }),
            Main({ text: ar.description })
        ))
    }
}

const showVideos = (articles: RssArticle[]) => {
    const articleContainer = document.querySelector('#videos')
    articleContainer.innerHTML = null

    for (let a of articles) {
        articleContainer.appendChild(
            Article({},
                Div({ onClick: () => fetch(`http://localhost:6969/${a.link}`) },
                    Img({ src: a.thumbnail }),
                    H2({ text: a.title })),
                Small({ text: a.date.toDateString() }),
                Details({},
                    Summary({ text: 'Description' }),
                    Main({ text: a.description }))
            ))
    }
}

const s = document.querySelector('#sidebar')
document.querySelector('#save-channels').addEventListener('click', () => {
    saveChannels(channels)
})

document.querySelector('#load-channels').addEventListener('click', () => {
    const channels = loadChannels()
    s.append(populateChannelList(channels))
})

const CORSproxies = [
    'https://cors-anywhere.herokuapp.com/',
    'http://crossorigin.me/',
    'https://cors-proxy.htmldriven.com/?url=',
    'http://www.whateverorigin.org/get?url=',
    'https://cors.io/?',
    'http://dry-sierra-94326.herokuapp.com/',
    'https://thingproxy.freeboard.io/fetch/',
    'https://cors.now.sh/',
    'https://free-cors-proxy.herokuapp.com',
    'https://corsproxy.our.buildo.io',
    'http://www.corsify.me/',
    'http://gobetween.oklabs.org/pipe/',
    'http://cors.hyoo.ru/',
    'https://cors4js.appspot.com/?url=',
    'http://fuck-cors.com/?url=',
    'https://proxy-sauce.glitch.me/',
]

/**** for testing purposes */

channels = [
    MakeFeed('lukesmith.xyz', 'https://lukesmith.xyz/rss.xml'),
    MakeAggregateFeed('Videos', AggregateFeedType.Video, [
        MakeFeed('the art of code', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCcAlTqd9zID6aNX3TzwxJXg'),
        MakeFeed('meth squad', 'https://www.youtube.com/feeds/videos.xml?channel_id=UC8PqFD4Nqk4PbqvCwudmQww'),
        MakeFeed('jreg', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCGSGPehp0RWfca-kENgBJ9Q'),
        MakeFeed('mental outlaw', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCZEvYxVEr0MMUG2ZCpG8bRA'),
        MakeFeed('luke smith', 'https://www.youtube.com/feeds/videos.xml?channel_id=UC2eYFnH61tmytImy1mTYvhA'),
        MakeFeed('low level javascript', 'https://www.youtube.com/feeds/videos.xml?channel_id=UC56l7uZA209tlPTVOJiJ8Tw'),
        MakeFeed('kittydog', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCOdo9GU0enYmMD3shBfDF9g'),
        MakeFeed('vivzypop', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCLNfsUeQm6zU2eBlQbEy4tw'),
        MakeFeed('cloy', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCBQAre4rMQmvpKN_-WY5uPQ'),
        MakeFeed('typh', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCdARcqAEmGmU9ppAx8KHiVQ'),
        MakeFeed('sr pelo', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCAeDC-kFK69W87jQu7RmxSA'),
        MakeFeed('context free', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCS4FAVeYW_IaZqAbqhlvxlA'),
        MakeFeed('hochelaga', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCjP-MiAEn9DPvUHNyGEs7Wg'),
        MakeFeed('GypsyCrusader', 'https://www.bitchute.com/feeds/rss/channel/Gypsycrusader/')
    ])
]

    ; (async () => {
        const data = await updateFeeds(channels)

        // let l = localStorage.getItem('typh')

        // if (!l) {

        //     const feed = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCdARcqAEmGmU9ppAx8KHiVQ'
        //     const proxy = CORSproxies[0]
        //     const url = `${proxy}${feed}`
        //     console.log(url)
        //     const res = await fetch(url)
        //     l = await res.text()
        //     localStorage.setItem('typh', l)
        // }

        // const articles = parseRss(l)
        //     ; (window as any).rss = articles
        // console.log(articles)
        showVideos(data.get('Videos'))
    })()

s.append(populateChannelList(channels))

/**** for testing purposes */
