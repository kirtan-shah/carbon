import React from 'react'
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'
import Axios from 'axios'
import domtoimage from 'dom-to-image'

import Page from '../components/Page'
import ReadFileDropContainer from '../components/ReadFileDropContainer'
import Toolbar from '../components/Toolbar'
import Carbon from '../components/Carbon'
import api from '../lib/api'
import { THEMES, LANGUAGES, DEFAULT_LANGUAGE, COLORS, DEFAULT_CODE } from '../lib/constants'

class Editor extends React.Component {
  /* pathname, asPath, err, req, res */
  static async getInitialProps ({ asPath }) {
    try {
      if (asPath !== '/') {
        const content = await api.getGist(asPath)
        return { content }
      }
    } catch (e) {
      console.log(e)
    }
    return {}
  }

  constructor()  {
    super()
    this.state = {
      background: '#ABB8C3',
      theme: THEMES[0].id,
      language: DEFAULT_LANGUAGE,
      dropShadow: true,
      windowControls: true,
      paddingVertical: '48px',
      paddingHorizontal: '32px'
    }
  }

  save () {
    const node = document.getElementById('section')

    const config = {
      style: {
        transform: 'scale(2)',
        'transform-origin': 'center'
      },
      width: node.offsetWidth * 2,
      height: node.offsetHeight * 2
    }

    domtoimage.toPng(node, config)
      .then((dataUrl) => {
        const link = document.createElement('a')
        link.download = 'snippet.png'
        link.href = dataUrl
        link.click()
      })
  }

  upload () {
    domtoimage.toBlob(document.getElementById('container'))
      .then(api.uploadImage)
      .then(res => res.data.id)
      .then(id => `http://i.imgur.com/${id}`)
      .then(console.log)
  }

  render () {
    return (
        <Page enableHeroText>
          {/* TODO this doesn't update the render */}
          <ReadFileDropContainer
            onDrop={(droppedContent) => {
              console.log(droppedContent)
              this.setState({ droppedContent })
            }}
          >
            <div id="editor">
              <Toolbar
                save={this.save}
                upload={this.upload}
                onBGChange={color => this.setState({ background: color })}
                onThemeChange={theme => this.setState({ theme: theme.id })}
                onLanguageChange={language => this.setState({ language })}
                onSettingsChange={(key, value) => this.setState({ [key]: value })}
                bg={this.state.background}
                enabled={this.state}
              />
              <Carbon config={this.state}>
                {this.state.droppedContent || this.props.content || DEFAULT_CODE}
              </Carbon>
            </div>
          </ReadFileDropContainer>
          <style jsx>{`
            #editor {
              background: ${COLORS.BLACK};
              border: 3px solid ${COLORS.SECONDARY};
              border-radius: 8px;
              padding: 16px;
            }
          `}
          </style>
        </Page>
    )
  }
}

export default DragDropContext(HTML5Backend)(Editor)
