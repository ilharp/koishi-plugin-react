import { Context, Schema, Service } from 'koishi'
import { createReadStream } from 'node:fs'
import { dirname, join } from 'node:path'

declare module 'koishi' {
  interface Context {
    react: ReactService
  }
}

export const name = 'react'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  ctx.plugin(ReactService)
}

export class ReactService extends Service {
  constructor(ctx: Context) {
    super(ctx, 'react')

    ctx.router.get('/react(.*)', (ctx) => {
      let hit = false
      if (ctx.URL.pathname.startsWith(this.client.react)) {
        ctx.body = createReadStream(this.local.react)
        hit = true
      }

      if (ctx.URL.pathname.startsWith(this.client['react-dom'])) {
        ctx.body = createReadStream(this.local['react-dom'])
        hit = true
      }

      if (hit) {
        ctx.type = 'js'
        return
      }

      ctx.body = '404 not found'
      ctx.status = 404
    })
  }

  local = {
    react: join(
      dirname(require.resolve('react')),
      'umd/react.production.min.js'
    ),
    'react-dom': join(
      dirname(require.resolve('react-dom')),
      'umd/react-dom.production.min.js'
    ),
  }

  client = {
    react: '/react/react.production.min.js',
    'react-dom': '/react/react-dom.production.min.js',
  }

  htmlSnippet = [this.client.react, this.client['react-dom']]
    .map((x) => `<script crossorigin src="${x}"></script>`)
    .join()
}
