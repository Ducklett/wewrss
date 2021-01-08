import { A, Article, Button, Details, H2, Img, Main, Small, Summary } from "./domfluid"
import { Channel, FeedType, loadFeeds, RssArticle, RssData, shapeFeeds, updateFeeds } from "./rss"

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

const DateTime = (d: Date) => Small({ text: d.toDateString() })

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
            DateTime(a.date),
            linkifyMedia(Main({ innerHTML: a.description })))
    },
    [FeedType.Video]: {
        id: 'videos',
        render: (a: RssArticle) => Article({},
            // /* shitty mpv forwarding */ Div({ onClick: () => fetch(`http://localhost:6969/${a.link}`) },
            A({ href: a.link, target: '_blank' },
                Img({ src: a.thumbnail }),
                H2({ text: a.title })),
            DateTime(a.date),
            Details({},
                Summary({ text: 'Description' }),
                Main({ text: a.description })))
    },
    [FeedType.Article]: {
        id: 'articles',
        render: (a: RssArticle) => Article({},
            A({ href: a.link, target: '_blank' },
                H2({ text: a.title })),
            DateTime(a.date),
            Main({ innerHTML: a.description }))
    },
}

interface GuiDependencies {
    channels: Channel[]
    layout: HTMLElement,
    sidebar: HTMLElement,
    articleContainer: HTMLElement,
    menuBtn: HTMLButtonElement,
    nextBtn: HTMLButtonElement,
    prevBtn: HTMLButtonElement
    updateBtn: HTMLButtonElement
    updateProgress: HTMLElement,
}

export default async ({
    channels,
    layout,
    sidebar,
    articleContainer,
    menuBtn,
    nextBtn,
    prevBtn,
    updateBtn,
    updateProgress,
}: GuiDependencies) => {

    const desktopWidth = 1200

    let data: RssData | null
    let lastChannel: Channel | null
    let currentPage = 0

    const showFeed = (channel: Channel, page = 0) => {
        if (window.innerWidth < desktopWidth) layout.classList.add('menu-hidden')

        lastChannel = channel
        let articles = data.get(channel.name)
        const displayType = channel.type || FeedType.Article

        currentPage = page
        const itemsPerPage = 30
        const displayFrom = itemsPerPage * page
        const displayTo = itemsPerPage * (page + 1)
        const len = articles.length
        articles = articles.slice(displayFrom, displayTo)

        console.log('page', page)
        console.log('len', len)
        console.log('to', displayTo)
        setVisibility(prevBtn, page > 0)
        setVisibility(nextBtn, len > displayTo)

        const gui = feedGuis[displayType]
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
                onClick: () => showFeed(c),
            })))

    const showData = async (forceUpdate = false, page = 0) => {
        const countUpdated = (x, y) => {
            if (x == 0) setVisibility(updateProgress, true)
            if (x == y) setVisibility(updateProgress, false)
            updateProgress.querySelector('span').textContent = `${x}/${y}`
        }
        const flatData = await loadFeeds()
        data = (flatData.size > 0 && !forceUpdate)
            ? shapeFeeds(flatData, channels)
            : await updateFeeds(channels, countUpdated)
        console.log(data)

            ; (window as any).data = data

        showFeed((lastChannel || channels[0]), page)
    }

    const toggleMenu = () => {
        const hidden = layout.classList.contains('menu-hidden')
        if (hidden) {
            layout.classList.remove('menu-hidden')
        } else {
            layout.classList.add('menu-hidden')
        }
    }


    if (window.innerWidth < desktopWidth) toggleMenu()

    menuBtn.addEventListener('click', toggleMenu)

    prevBtn.addEventListener('click', () => showFeed(lastChannel, currentPage - 1))
    nextBtn.addEventListener('click', () => showFeed(lastChannel, currentPage + 1))
    updateBtn.addEventListener('click', () => showData(true, currentPage))

    showData()
    populateChannelList(channels)
}
