import { A, Article, Button, Details, H2, Img, Main, Small, Summary } from "./domfluid"
import { Channel, FeedType, loadFeeds, RssArticle, RssData, shapeFeeds, updateFeeds } from "./rss"

interface GuiDependencies {
    channels: Channel[]
    sidebar: HTMLElement,
    articleContainer: HTMLElement,
    nextBtn: HTMLButtonElement,
    prevBtn: HTMLButtonElement
}

const setChildren = (parent: HTMLElement, children: HTMLElement[]) => {
    parent.innerHTML = null
    for (let ch of children) parent.appendChild(ch)
}

const setVisibility = (el: HTMLElement, visible: boolean) => {
    visible ? el.classList.remove('hidden') : el.classList.add('hidden')
}

const linkifyMedia = (root: HTMLElement) => {
    const media: HTMLElement[] = root.querySelectorAll('img, video') as any

    for (let med of media) {
        med.style.maxWidth = null
        med.style.cursor = 'pointer'
        med.addEventListener('click', () => {
            const source = (med as HTMLImageElement).src || med.querySelector('source').src
            const win = window.open(source, '_blank');
            win.focus()
        })
    }

    return root
}

type FeedTypeGui = { id: string, render: (a: RssArticle) => HTMLElement }

type FeedTypeGuis = {
    [FeedType.MicroBlog]: FeedTypeGui,
    [FeedType.Video]: FeedTypeGui,
    [FeedType.Article]: FeedTypeGui,
}

const feedGuis: FeedTypeGuis = {
    [FeedType.MicroBlog]: {
        id: 'microblog',
        render: (a: RssArticle) => Article({},
            Small({ text: a.date.toDateString() }),
            linkifyMedia(Main({ innerHTML: a.description })))
    },
    [FeedType.Video]: {
        id: 'videos',
        render: (a: RssArticle) => Article({},
            // /* shitty mpv forwarding */ Div({ onClick: () => fetch(`http://localhost:6969/${a.link}`) },
            A({ href: a.link, target: '_blank' },
                Img({ src: a.thumbnail }),
                H2({ text: a.title })),
            Small({ text: a.date.toDateString() }),
            Details({},
                Summary({ text: 'Description' }),
                Main({ text: a.description })))
    },
    [FeedType.Article]: {
        id: 'articles',
        render: (a: RssArticle) => Article({},
            A({ href: a.link, target: '_blank' },
                H2({ text: a.title })),
            Small({ text: a.date.toDateString() }),
            Main({ innerHTML: a.description }))
    },
}

export default async ({
    channels,
    sidebar,
    articleContainer,
    nextBtn,
    prevBtn,
}: GuiDependencies) => {

    let data: RssData | null
    let lastChannel: Channel | null


    const showFeed = (articles: RssArticle[], displayType: FeedType, page = 0) => {
        const itemsPerPage = 30
        articles = articles.slice(itemsPerPage * page, itemsPerPage * (page + 1))

        console.log('fuck', articles)
        console.log('disp', displayType)

        const gui = feedGuis[displayType]
        console.log(displayType, gui)
        articleContainer.id = gui.id
        const articleNodes = articles.map(gui.render)

        setChildren(articleContainer, articleNodes)
    }

    const populateChannelList = (channels: Channel[]) =>
        setChildren(sidebar, channels.map((c) =>
            Button({
                text: c.name,
                class: 'channel-button',
                // TODO: get the data again
                onClick: () => showFeed(data.get(c.name), c.type || FeedType.Article),
            })))

    const showData = async (forceUpdate = false) => {
        const flatData = await loadFeeds()
        data = (flatData.size > 0 && !forceUpdate)
            ? shapeFeeds(flatData, channels)
            : await updateFeeds(channels)
        console.log(data)

            ; (window as any).data = data

        const ch = (lastChannel || channels[0])
        showFeed(data.get(ch.name), ch.type || FeedType.Article)
    }

    showData()
    populateChannelList(channels)
}
