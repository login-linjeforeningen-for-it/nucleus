import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const podfilePath = join(process.cwd(), 'ios', 'Podfile')
const podfile = readFileSync(podfilePath, 'utf8')
const marker = "config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'"

if (podfile.includes(marker)) {
    process.exit(0)
}

const anchor = `    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
      :ccache_enabled => ccache_enabled?(podfile_properties),
    )
`

const replacement = `${anchor}
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
        config.build_settings['CODE_SIGNING_REQUIRED'] = 'NO'
        config.build_settings['EXPANDED_CODE_SIGN_IDENTITY'] = ''
      end
    end
`

if (!podfile.includes(anchor)) {
    throw new Error('Unable to find react_native_post_install block in ios/Podfile')
}

writeFileSync(podfilePath, podfile.replace(anchor, replacement))
