export interface DomFluidNodeOptions {
  id?: string
  class?: string
  text?: string
  innerHTML?: string | HTMLElement
  src?: string
  href?: string
  target?: '_blank' | '_parent' | '_self' | '_top'
  onClick?: () => any
}

export const WrapElement = <T extends keyof HTMLElementTagNameMap>(name: T) => (
  options: DomFluidNodeOptions,
  ...children: HTMLElement[]
) => $(name, { ...options }, ...children)

export const $ = <T extends keyof HTMLElementTagNameMap>(
  name: T,
  options: DomFluidNodeOptions,
  ...children: HTMLElement[]
): HTMLElementTagNameMap[T] => {
  const el = document.createElement(name)
  document.createElement(name)
  for (let op of Object.keys(options as object)) {
    switch (op) {
      case 'class':
        options.class.split(' ').forEach(c => el.classList.add(c))
        break
      case 'text':
        el.textContent = options.text
        break
      case 'onClick':
        el.addEventListener('click', options.onClick)
        break
      default:
        ;(el as any)[op] = options[op]
        break
    }
  }

  children.forEach(child => child && el.appendChild(child))

  return el
}

export const A = WrapElement('a')
export const Abbr = WrapElement('abbr')
export const Address = WrapElement('address')
export const Applet = WrapElement('applet')
export const Area = WrapElement('area')
export const Article = WrapElement('article')
export const Aside = WrapElement('aside')
export const Audio = WrapElement('audio')
export const B = WrapElement('b')
export const Base = WrapElement('base')
export const Basefont = WrapElement('basefont')
export const Bdi = WrapElement('bdi')
export const Bdo = WrapElement('bdo')
export const Blockquote = WrapElement('blockquote')
export const Body = WrapElement('body')
export const Br = WrapElement('br')
export const Button = WrapElement('button')
export const Canvas = WrapElement('canvas')
export const Caption = WrapElement('caption')
export const Cite = WrapElement('cite')
export const Code = WrapElement('code')
export const Col = WrapElement('col')
export const Colgroup = WrapElement('colgroup')
export const Data = WrapElement('data')
export const Datalist = WrapElement('datalist')
export const Dd = WrapElement('dd')
export const Del = WrapElement('del')
export const Details = WrapElement('details')
export const Dfn = WrapElement('dfn')
export const Dialog = WrapElement('dialog')
export const Dir = WrapElement('dir')
export const Div = WrapElement('div')
export const Dl = WrapElement('dl')
export const Dt = WrapElement('dt')
export const Em = WrapElement('em')
export const Embed = WrapElement('embed')
export const Fieldset = WrapElement('fieldset')
export const Figcaption = WrapElement('figcaption')
export const Figure = WrapElement('figure')
export const Font = WrapElement('font')
export const Footer = WrapElement('footer')
export const Form = WrapElement('form')
export const Frame = WrapElement('frame')
export const Frameset = WrapElement('frameset')
export const H1 = WrapElement('h1')
export const H2 = WrapElement('h2')
export const H3 = WrapElement('h3')
export const H4 = WrapElement('h4')
export const H5 = WrapElement('h5')
export const H6 = WrapElement('h6')
export const Head = WrapElement('head')
export const Header = WrapElement('header')
export const Hgroup = WrapElement('hgroup')
export const Hr = WrapElement('hr')
export const Html = WrapElement('html')
export const I = WrapElement('i')
export const Iframe = WrapElement('iframe')
export const Img = WrapElement('img')
export const Input = WrapElement('input')
export const Ins = WrapElement('ins')
export const Kbd = WrapElement('kbd')
export const Label = WrapElement('label')
export const Legend = WrapElement('legend')
export const Li = WrapElement('li')
export const Link = WrapElement('link')
export const Main = WrapElement('main')
export const Map = WrapElement('map')
export const Mark = WrapElement('mark')
export const Marquee = WrapElement('marquee')
export const Menu = WrapElement('menu')
export const Meta = WrapElement('meta')
export const Meter = WrapElement('meter')
export const Nav = WrapElement('nav')
export const Noscript = WrapElement('noscript')
export const _Object = WrapElement('object')
export const Ol = WrapElement('ol')
export const Optgroup = WrapElement('optgroup')
export const Option = WrapElement('option')
export const Output = WrapElement('output')
export const P = WrapElement('p')
export const Param = WrapElement('param')
export const Picture = WrapElement('picture')
export const Pre = WrapElement('pre')
export const Progress = WrapElement('progress')
export const Q = WrapElement('q')
export const Rp = WrapElement('rp')
export const Rt = WrapElement('rt')
export const Ruby = WrapElement('ruby')
export const S = WrapElement('s')
export const Samp = WrapElement('samp')
export const Script = WrapElement('script')
export const Section = WrapElement('section')
export const Select = WrapElement('select')
export const Slot = WrapElement('slot')
export const Small = WrapElement('small')
export const Source = WrapElement('source')
export const Span = WrapElement('span')
export const Strong = WrapElement('strong')
export const Style = WrapElement('style')
export const Sub = WrapElement('sub')
export const Summary = WrapElement('summary')
export const Sup = WrapElement('sup')
export const Table = WrapElement('table')
export const Tbody = WrapElement('tbody')
export const Td = WrapElement('td')
export const Template = WrapElement('template')
export const Textarea = WrapElement('textarea')
export const Tfoot = WrapElement('tfoot')
export const Th = WrapElement('th')
export const Thead = WrapElement('thead')
export const Time = WrapElement('time')
export const Title = WrapElement('title')
export const Tr = WrapElement('tr')
export const Track = WrapElement('track')
export const U = WrapElement('u')
export const Ul = WrapElement('ul')
export const Var = WrapElement('var')
export const Video = WrapElement('video')
export const Wbr = WrapElement('wbr')
