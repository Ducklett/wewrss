export enum FeedType {
  Article = 'article',
  MicroBlog = 'microblog',
  Video = 'video',
  gallery = 'gallery'
}

export type Feed = {
  kind: 'single'
  name: string
  type: FeedType | null
  source: string
}

export type AggregateFeed = {
  kind: 'aggregate'
  name: string
  type: FeedType
  feeds: Feed[]
}

export type Channel = Feed | AggregateFeed

export type SerializedRssData = {
  channels: Channel[]
}

export type RssArticle = {
  guid: string
  title: string
  contentAuthor?: string
  link: string
  date: Date
  description: string
  thumbnail?: string
  // used to do a channel header lookup
  // when the article is presented in an aggregate feed
  channelName?: string
}

export type RssHeader = {
  title: string
  description: string
  url: string
  image: string
  name: string
}

export type RssData = {
  headerMap: Map<string, RssHeader>
  articleMap: Map<string, RssArticle[]>
}

export const MakeFeed = (
  name: string,
  source: string,
  type: FeedType = null
): Feed => ({ kind: 'single', name, source, type })

export const MakeAggregateFeed = (
  name: string,
  type: FeedType,
  feeds: Feed[] = []
): AggregateFeed => ({ kind: 'aggregate', name, type, feeds })

export const saveChannels = (channels: Channel[]) => {
  localStorage.setItem('rssChannels', JSON.stringify(channels))
  return channels
}

export const loadChannels = (): Channel[] =>
  JSON.parse(localStorage.getItem('rssChannels'))

export const parseRss = (feed: string): [RssHeader, RssArticle[]] => {
  const dom: Document = new window.DOMParser().parseFromString(feed, 'text/xml')

  const feedType = dom.querySelector('feed')?.getAttribute('xmlns:yt')
    ? 'youtube'
    : dom.querySelector('rss')?.getAttribute('version') === '2.0'
    ? 'atomv2'
    : dom.querySelector('feed')?.getAttribute('xmlns') ===
      'http://www.w3.org/2005/Atom'
    ? 'atomv1'
    : 'unknown'

  let header: RssHeader = {
    title: '',
    description: '',
    url: '',
    image: '',
    name: ''
  }

  const items: RssArticle[] = []

  switch (feedType) {
    case 'youtube':
      {
        const author = dom.querySelector('author')
        if (author) {
          header.title = author.querySelector('name')?.textContent
          header.url = author.querySelector('uri')?.textContent
        }

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
            thumbnail: it
              .getElementsByTagName('media:group')[0]
              .getElementsByTagName('media:thumbnail')[0]
              .getAttribute('url')
          })
        }
      }
      break
    case 'atomv2':
      {
        const channel = dom.querySelector('channel')
        if (channel) {
          let linkElem: HTMLElement = channel.querySelector('link')
          // why does this match...
          if (linkElem.tagName == 'atom:link') {
            linkElem = channel.querySelectorAll('link')[1]
          }

          header.title = channel.querySelector('title')?.textContent
          header.url = linkElem?.textContent
          header.description = channel.querySelector('description')?.textContent
          header.image = channel.querySelector('image>url')?.textContent
        }

        const domItems = dom.querySelectorAll('channel item')

        for (let it of domItems) {
          const creator =
            it.getElementsByTagName('dc:creator')[0]?.textContent ?? null

          items.push({
            contentAuthor: header.title.includes(creator) ? null : creator,
            guid: it.querySelector('guid')?.textContent,
            title: it.querySelector('title')?.textContent,
            link: it.querySelector('link')?.textContent,
            date: new Date(it.querySelector('pubDate')?.textContent),
            description: it.querySelector('description')?.textContent,
            thumbnail: (
              it.getElementsByTagName('media:thumbnail')[0] ||
              it.querySelector('enclosure')
            )?.getAttribute('url')
          })
        }
      }
      break
    case 'atomv1':
      {
        const domItems = dom.querySelectorAll('entry')

        header.title = dom.querySelector('title')?.textContent
        header.url = dom.querySelector('link')?.getAttribute('href')

        for (let it of domItems) {
          items.push({
            guid: it.querySelector('id')?.textContent,
            title: it.querySelector('title')?.textContent,
            link: it.querySelector('link')?.getAttribute('href'),
            date: new Date(
              it.querySelector('published')?.textContent ||
                it.querySelector('updated')?.textContent
            ),
            description: it.querySelector('content')?.innerHTML
          })
        }
      }
      break
    default: {
      console.error("couldn't parse feed type.")
    }
  }

  console.log(dom)

  return [header, items]
}

export const clearData = () => localStorage.removeItem('feedInfo')

/**
 * loads feeds from localstorage
 *
 * they are stored as a flat map, use `shapeFeeds()` to make aggregate feeds
 */
export const loadFeeds = async (): Promise<RssData> => {
  const str = localStorage.getItem('feedInfo')

  const data: RssData = {
    headerMap: new Map<string, RssHeader>(),
    articleMap: new Map<string, RssArticle[]>()
  }

  if (!str) return data

  const obj = JSON.parse(str)

  console.log(obj)

  for (let k of Object.keys(obj.articleMap)) {
    for (let ar of obj.articleMap[k]) {
      ar.date = new Date(ar.date)
    }
    data.articleMap.set(k, obj.articleMap[k])
  }
  for (let k of Object.keys(obj.headerMap)) {
    data.headerMap.set(k, obj.headerMap[k])
  }

  return data
}

export const shapeFeeds = (
  data: Map<string, RssArticle[]>,
  channels: Channel[]
) => {
  const shaped = new Map<string, RssArticle[]>()

  for (let ch of channels) {
    switch (ch.kind) {
      case 'aggregate':
        const aggragatedArticles = ch.feeds
          .reduce((arr, feed) => {
            console.log('adding ' + feed.name)
            return arr.concat(data.get(feed.name))
          }, [] as RssArticle[])
          .sort((a, b) => b.date.getTime() - a.date.getTime())
        shaped.set(ch.name, aggragatedArticles)
        break
      case 'single':
        shaped.set(ch.name, data.get(ch.name))
        break
    }
  }

  return shaped
}

export const updateFeed = async (feed: Feed, corsProxy: string) => {
  const url = `${corsProxy}${feed.source}`
  console.log('updating ' + url)
  const res = await fetch(url)
  const text = await res.text()

  const data = parseRss(text)
  data[0].name = feed.name
  data[1].forEach(ar => {
    ar.channelName = feed.name
  })

  return data
}

export const updateFeeds = async (
  channels: Channel[],
  corsProxy: string,
  progressCallback: (completed: number, total: number) => any
): Promise<[RssData, Map<string, RssArticle[]>]> => {
  const data: RssData = {
    headerMap: new Map<string, RssHeader>(),
    articleMap: new Map<string, RssArticle[]>()
  }

  let completed = 0
  const channelCount = channels.reduce(
    (acc, c) => (c.kind == 'single' ? acc + 1 : acc + c.feeds.length),
    0
  )

  progressCallback(0, channelCount)
  const incrementCompletion = () => progressCallback(++completed, channelCount)

  const updates = []

  for (let ch of channels) {
    switch (ch.kind) {
      case 'aggregate': {
        for (let fd of ch.feeds) {
          const update = updateFeed(fd, corsProxy).then(
            ([header, feedArticles]) => {
              incrementCompletion()
              data.headerMap.set(fd.name, header)
              data.articleMap.set(fd.name, feedArticles)
            }
          )
          updates.push(update)
        }
        break
      }
      case 'single': {
        const update = await updateFeed(ch, corsProxy).then(
          ([header, articles]) => {
            incrementCompletion()
            data.articleMap.set(ch.name, articles)
            data.headerMap.set(ch.name, header)
          }
        )
        updates.push(update)
        break
      }
    }
  }

  await Promise.all(updates)

  localStorage.setItem(
    'feedInfo',
    JSON.stringify({
      headerMap: Object.fromEntries(data.headerMap),
      articleMap: Object.fromEntries(data.articleMap)
    })
  )

  console.log('done!')
  console.log(data)

  const flat = data.articleMap
  data.articleMap = shapeFeeds(data.articleMap, channels)

  return [data, flat]
}
