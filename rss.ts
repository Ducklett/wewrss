export enum AggregateFeedType {
    Article,
    MicroBlog,
    Video,
}

export type Feed = {
    kind: 'single',
    name: string,
    source: string,
}

export type AggregateFeed = {
    kind: 'aggregate',
    name: string,
    type: AggregateFeedType,
    feeds: Feed[],
}

export type Channel = Feed | AggregateFeed

export type SerializedRssData = {
    channels: Channel[],
}

export type RssArticle = {
    guid: string,
    title: string,
    link: string,
    date: Date,
    description: string,
    thumbnail: string | null,
}

export const MakeFeed = (name: string, source: string): Feed =>
    ({ kind: 'single', name, source })

export const MakeAggregateFeed = (name: string, type: AggregateFeedType, feeds: Feed[] = []): AggregateFeed =>
    ({ kind: 'aggregate', name, type, feeds })

export const saveChannels = (channels: Channel[]) =>
    localStorage.setItem('rssChannels', JSON.stringify(channels))

export const loadChannels = (): Channel[] =>
    JSON.parse(localStorage.getItem('rssChannels')) || []

export const parseRss = (feed: string): RssArticle[] => {
    const dom: Document = new window.DOMParser().parseFromString(feed, "text/xml")

    const isYoutube = dom.querySelector('feed')?.getAttribute('xmlns:yt')

    const items: RssArticle[] = []

    if (isYoutube) {

        const domItems = dom.querySelectorAll('entry')

        for (let it of domItems) {
            items.push({
                guid: it.querySelector('link')?.getAttribute('href'),
                title: it.querySelector('title')?.textContent,
                // link: it.querySelector('link')?.textContent,
                link: it.querySelector('link')?.getAttribute('href'),
                // date: new Date(it.querySelector('pubDate')?.textContent),
                date: new Date(it.querySelector('published')?.textContent),
                description: it.querySelector('description')?.textContent,
                thumbnail: (it.getElementsByTagName('media:group')[0].getElementsByTagName('media:thumbnail')[0]).getAttribute('url'),
            })
        }
    } else {
        const domItems = dom.querySelectorAll('channel item')

        for (let it of domItems) {
            items.push({
                guid: it.querySelector('guid')?.textContent,
                title: it.querySelector('title')?.textContent,
                link: it.querySelector('link')?.textContent,
                date: new Date(it.querySelector('pubDate')?.textContent),
                description: it.querySelector('description')?.textContent,
                thumbnail: it.querySelector('enclosure')?.getAttribute('url'),
            })
        }
    }

    console.log(dom)

    return items
}

export const updateFeed = async (feed: Feed) => {
    const proxy = 'https://cors-anywhere.herokuapp.com/'
    const url = `${proxy}${feed.source}`
    console.log('updating ' + url)
    const res = await fetch(url)
    const text = await res.text()

    const articles = parseRss(text)

    return articles
}
export const updateFeeds = async (channels: Channel[]) => {
    const newFeedInfo = new Map<string, RssArticle[]>()

    for (let ch of channels) {
        let articles: RssArticle[] = []

        switch (ch.kind) {
            case 'aggregate': {

                for (let fd of ch.feeds) {
                    const feedArticles = await updateFeed(fd)
                    articles = articles.concat(feedArticles)
                }

                articles.sort((a, b) => b.date.getTime() - a.date.getTime())
                break
            }
            case 'single': {
                articles = await updateFeed(ch)
                newFeedInfo.set(ch.name, articles)
                break
            }
        }

        newFeedInfo.set(ch.name, articles)
    }

    localStorage.setItem('feedInfo', JSON.stringify(newFeedInfo))

    console.log('done!')
    console.log(newFeedInfo)
    return newFeedInfo
}
