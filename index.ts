import { FeedType, Channel, Feed, loadChannels, MakeAggregateFeed, MakeFeed, parseRss, RssArticle, saveChannels, updateFeed, updateFeeds, loadFeeds, shapeFeeds } from "./rss"
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
            onClick: () => showFeed(c),
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
                // Div({ onClick: () => fetch(`http://localhost:6969/${a.link}`) },
                A({ href: a.link, target: '_blank' },
                    Img({ src: a.thumbnail }),
                    H2({ text: a.title })),
                Small({ text: a.date.toDateString() }),
                Details({},
                    Summary({ text: 'Description' }),
                    Main({ text: a.description }))
            ))
    }
}

const linkifyMedia = (root: HTMLElement) => {
    const media = root.querySelectorAll('img, video')
    for (let med of media) {
        (med as HTMLElement).style.cursor = 'pointer'
        med.addEventListener('click', () => {
            const source = (med as HTMLImageElement).src || med.querySelector('source').src
            const win = window.open(source, '_blank');
            win.focus()
        })
    }

    return root
}
const showMicroblog = (articles: RssArticle[]) => {
    console.log(articles)
    const articleContainer = document.querySelector('#microblog')
    articleContainer.innerHTML = null

    for (let a of articles) {
        document.body.innerHTML
        articleContainer.appendChild(Article({},
            Small({ text: a.date.toDateString() }),
            linkifyMedia(Main({ innerHTML: a.description })))
        )
    }
}

let data: Map<string, RssArticle[]> | null
let lastChannel: Channel | null

const showFeed = (feed: Channel) => {
    if (!data) return

    const articles = data.get(feed.name)

    document.querySelector('#videos').innerHTML = null
    document.querySelector('#microblog').innerHTML = null
    document.querySelector('#articles').innerHTML = null

    switch (feed.type) {
        case FeedType.MicroBlog: showMicroblog(articles); break
        case FeedType.Video: showVideos(articles); break
        case FeedType.Article: showArticles(articles); break
        default: showArticles(articles); break
    }
}

const updateData = async () => {
    const data = await updateFeeds(channels)
    console.log(data)

        ; (window as any).data = data

    showFeed(lastChannel || channels[2])
}

const s = document.querySelector('#sidebar')
document.querySelector('#update-channels').addEventListener('click', updateData)


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
    MakeAggregateFeed('Videos', FeedType.Video, [
        MakeFeed('the art of code', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCcAlTqd9zID6aNX3TzwxJXg'),
        MakeFeed('meth squad', 'https://www.youtube.com/feeds/videos.xml?channel_id=UC8PqFD4Nqk4PbqvCwudmQww'),
        MakeFeed('jreg', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCGSGPehp0RWfca-kENgBJ9Q'),
        MakeFeed('mental outlaw', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCZEvYxVEr0MMUG2ZCpG8bRA'),
        MakeFeed('luke smith', 'https://videos.lukesmith.xyz/feeds/videos.xml?sort=-publishedAt&filter=local'),
        MakeFeed('low level javascript', 'https://www.youtube.com/feeds/videos.xml?channel_id=UC56l7uZA209tlPTVOJiJ8Tw'),
        MakeFeed('kittydog', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCOdo9GU0enYmMD3shBfDF9g'),
        MakeFeed('vivzypop', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCLNfsUeQm6zU2eBlQbEy4tw'),
        MakeFeed('cloy', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCBQAre4rMQmvpKN_-WY5uPQ'),
        MakeFeed('typh', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCdARcqAEmGmU9ppAx8KHiVQ'),
        MakeFeed('sr pelo', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCAeDC-kFK69W87jQu7RmxSA'),
        MakeFeed('context free', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCS4FAVeYW_IaZqAbqhlvxlA'),
        MakeFeed('hochelaga', 'https://www.youtube.com/feeds/videos.xml?channel_id=UCjP-MiAEn9DPvUHNyGEs7Wg'),
        MakeFeed('GypsyCrusader', 'https://www.bitchute.com/feeds/rss/channel/Gypsycrusader/')
    ]),
    MakeAggregateFeed('Hell', FeedType.MicroBlog, [
        MakeFeed('Designer_Ojisan', 'https://nitter.net/Designer_Ojisan/media/rss'),
        MakeFeed('Spareribs_777', 'https://nitter.net/Spareribs_777/media/rss'),
        MakeFeed('_OVOIP', 'https://nitter.net/_OVOIP/media/rss'),
        MakeFeed('yupo_0322', 'https://nitter.net/yupo_0322/media/rss'),
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
        MakeFeed('lynxxe', 'https://nitter.net/lynxxe/media/rss'),
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

// git test shit

    ; (async () => {
        const flatData = await loadFeeds()
        data = (flatData.size > 0)
            ? shapeFeeds(flatData, channels)
            : await updateFeeds(channels)

            ; (window as any).data = data

        showFeed(lastChannel || channels[2])
    })()

s.append(populateChannelList(channels))

/**** for testing purposes */
