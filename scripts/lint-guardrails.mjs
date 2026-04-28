/* eslint-disable no-undef */
import fs from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'

const root = path.resolve(import.meta.dirname, '..')
const srcRoot = path.join(root, 'src')
const errors = []
const canonicalSpacingScale = new Map([
    ['0rem', '0'],
    ['0.125rem', '0.5'],
    ['0.25rem', '1'],
    ['0.375rem', '1.5'],
    ['0.5rem', '2'],
    ['0.625rem', '2.5'],
    ['0.75rem', '3'],
    ['0.875rem', '3.5'],
    ['1rem', '4'],
    ['1.25rem', '5'],
    ['1.5rem', '6'],
    ['1.75rem', '7'],
    ['2rem', '8'],
    ['2.25rem', '9'],
    ['2.5rem', '10'],
    ['2.75rem', '11'],
    ['3rem', '12'],
    ['3.5rem', '14'],
    ['4rem', '16'],
    ['5rem', '20'],
    ['6rem', '24'],
    ['7rem', '28'],
    ['8rem', '32'],
    ['9rem', '36'],
    ['10rem', '40'],
    ['11rem', '44'],
    ['12rem', '48'],
    ['13rem', '52'],
    ['14rem', '56'],
    ['15rem', '60'],
    ['16rem', '64'],
    ['18rem', '72'],
    ['20rem', '80'],
    ['24rem', '96'],
])
const canonicalTextScale = new Map([
    ['0.75rem', 'xs'],
    ['0.875rem', 'sm'],
    ['1rem', 'base'],
    ['1.125rem', 'lg'],
    ['1.25rem', 'xl'],
    ['1.5rem', '2xl'],
    ['1.875rem', '3xl'],
    ['2.25rem', '4xl'],
    ['3rem', '5xl'],
    ['3.75rem', '6xl'],
    ['4.5rem', '7xl'],
    ['6rem', '8xl'],
    ['8rem', '9xl'],
])
const canonicalLeadingScale = new Map([
    ['0.75rem', '3'],
    ['1rem', '4'],
    ['1.25rem', '5'],
    ['1.5rem', '6'],
    ['1.75rem', '7'],
    ['2rem', '8'],
    ['2.25rem', '9'],
    ['2.5rem', '10'],
    ['3rem', '12'],
])
const canonicalRadiusScale = new Map([
    ['0rem', 'none'],
    ['0.125rem', 'xs'],
    ['0.25rem', 'sm'],
    ['0.375rem', 'md'],
    ['0.5rem', 'lg'],
    ['0.75rem', 'xl'],
    ['1rem', '2xl'],
    ['1.5rem', '3xl'],
    ['2rem', '4xl'],
])
const canonicalAliasClasses = new Map([
    ['break-words', 'wrap-break-word'],
    ['wrap-words', 'wrap-break-word'],
    ['wrap-break-words', 'wrap-break-word'],
])

const sourceFiles = await collectSourceFiles(srcRoot)

for (const filePath of sourceFiles) {
    const text = await fs.readFile(filePath, 'utf8')
    const kind = filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    const source = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, kind)

    visit(source, (node) => {
        if (!ts.isJsxOpeningLikeElement(node)) {
            if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && shouldValidateStringLiteral(node)) {
                validateTokenString(filePath, source, node, node.text, 'string literal')
            }
            return
        }

        validateClassAttributes(filePath, source, node)
    })
}

if (errors.length > 0) {
    console.error('\nGuardrail lint failed:\n')
    for (const error of errors) {
        console.error(`- ${error}`)
    }
    process.exit(1)
}

console.log('Guardrail lint passed.')

async function collectSourceFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    const files = await Promise.all(entries.map(async (entry) => {
        const entryPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            return collectSourceFiles(entryPath)
        }

        if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
            return [entryPath]
        }

        return []
    }))

    return files.flat()
}

function validateClassAttributes(filePath, source, node) {
    for (const attributeName of ['className', 'class']) {
        const value = getJsxAttributeText(node, attributeName)
        if (!value) {
            continue
        }

        const tokens = value.trim().split(/\s+/).filter(Boolean)
        for (const token of tokens) {
            const suggestion = getCanonicalClassSuggestion(token)
            if (suggestion) {
                errors.push(`
                    ${formatLocation(filePath, source, node)}:
                    ${attributeName} uses \`${token}\`, write \`${suggestion}\` instead.
                `)
            }
        }
    }
}

function validateTokenString(filePath, source, node, value, label) {
    const tokens = value.trim().split(/\s+/).filter(Boolean)
    for (const token of tokens) {
        const suggestion = getCanonicalClassSuggestion(token)
        if (suggestion) {
            errors.push(`${formatLocation(filePath, source, node)}: ${label} uses \`${token}\`, write \`${suggestion}\` instead.`)
        }
    }
}

function getCanonicalClassSuggestion(token) {
    const aliasMatch = token.match(/^((?:[^:\s]+:)*)((?:!?[^:\s]+))$/)
    if (aliasMatch) {
        const [, variants, utility] = aliasMatch
        const canonicalAlias = canonicalAliasClasses.get(utility)
        if (canonicalAlias) {
            return `${variants}${canonicalAlias}`
        }
    }

    const negativeTranslateMatch = token.match(/^((?:[^:\s]+:)*)-translate-([xy])-\[([^\]]+)\]$/)
    if (negativeTranslateMatch) {
        const [, variants, axis, rawValue] = negativeTranslateMatch
        return `${variants}translate-${axis}-[-${rawValue}]`
    }

    const negativeVariableCalcMatch = token.match(
        /^((?:[^:\s]+:)*)((?:!?)(?:m(?:[trblxy])?|inset(?:-[xy])?|top|right|bottom|left))-\[calc\(var\((--[^)\]]+)\)\s*\*\s*-1\)\]$/
    )
    if (negativeVariableCalcMatch) {
        const [, variants, utility, variableName] = negativeVariableCalcMatch
        return `${variants}-${utility}-(${variableName})`
    }

    const variableMatch = token.match(/^((?:[^:\s]+:)*)((?:!?[^:\s[]+))-\[var\((--[^)\]]+)\)\](\/[^\s]+)?$/)
    if (variableMatch) {
        const [, variants, utility, variableName, suffix = ''] = variableMatch
        return `${variants}${utility}-(${variableName})${suffix}`
    }

    const arbitraryOpacityMatch = token.match(/^((?:[^:\s]+:)*)((?:!?[^:\s/][^:\s]*))\/\[(.+)\]$/)
    if (arbitraryOpacityMatch) {
        const [, variants, utility, rawValue] = arbitraryOpacityMatch
        const canonicalOpacity = normalizeOpacityValue(rawValue)
        if (canonicalOpacity) {
            return `${variants}${utility}/${canonicalOpacity}`
        }
    }

    for (const [utilityPattern, scale] of [
        [/^((?:[^:\s]+:)*)((?:-)?(?:p|m)(?:[trblxy])?|gap(?:-[xy])?|space-[xy]|(?:min-|max-)?[wh]|size)-\[(.+)\]$/, canonicalSpacingScale],
        [/^((?:[^:\s]+:)*)((?:-)?text)-\[(.+)\]$/, canonicalTextScale],
        [/^((?:[^:\s]+:)*)((?:-)?leading)-\[(.+)\]$/, canonicalLeadingScale],
        [/^((?:[^:\s]+:)*)((?:!?rounded(?:-(?:t|r|b|l|tl|tr|br|bl|s|e|ss|se|ee|es))?))-\[(.+)\]$/, canonicalRadiusScale],
    ]) {
        const match = token.match(utilityPattern)
        if (!match) {
            continue
        }

        const [, variants, utility, rawValue] = match
        const normalized = normalizeSpacingValue(rawValue)
        if (!normalized) {
            continue
        }

        const canonical = scale.get(normalized)
        if (canonical) {
            return `${variants}${utility}-${canonical}`
        }
    }

    return null
}

function normalizeSpacingValue(rawValue) {
    const value = rawValue.trim().toLowerCase()
    const remMatch = value.match(/^(-?\d+(?:\.\d+)?)rem$/)
    if (!remMatch) {
        const pxMatch = value.match(/^(-?\d+(?:\.\d+)?)px$/)
        if (!pxMatch) {
            return null
        }

        const numericPx = Number(pxMatch[1])
        if (!Number.isFinite(numericPx)) {
            return null
        }

        if (numericPx === 1) {
            return '1px'
        }

        return `${numericPx / 16}rem`
    }

    const numeric = Number(remMatch[1])
    if (!Number.isFinite(numeric)) {
        return null
    }

    return `${numeric}rem`
}

function normalizeOpacityValue(rawValue) {
    const value = rawValue.trim().toLowerCase()
    if (value.endsWith('%')) {
        const numericPercent = Number(value.slice(0, -1))
        if (Number.isInteger(numericPercent) && numericPercent >= 0 && numericPercent <= 100) {
            return `${numericPercent}`
        }

        return null
    }

    const numeric = Number(value)
    if (!Number.isFinite(numeric) || numeric < 0 || numeric > 100) {
        return null
    }

    if (numeric <= 1) {
        const percentage = numeric * 100
        if (Number.isInteger(percentage)) {
            return `${percentage}`
        }

        return null
    }

    if (Number.isInteger(numeric)) {
        return `${numeric}`
    }

    return null
}

function getJsxAttributeText(node, name) {
    const attribute = node.attributes.properties.find((property) => {
        return ts.isJsxAttribute(property) && property.name.text === name
    })

    if (!attribute || !attribute.initializer) {
        return null
    }

    if (ts.isStringLiteral(attribute.initializer)) {
        return attribute.initializer.text
    }

    if (!ts.isJsxExpression(attribute.initializer) || !attribute.initializer.expression) {
        return null
    }

    if (ts.isStringLiteral(attribute.initializer.expression) || ts.isNoSubstitutionTemplateLiteral(attribute.initializer.expression)) {
        return attribute.initializer.expression.text
    }

    return null
}

function visit(node, cb) {
    cb(node)
    ts.forEachChild(node, (child) => visit(child, cb))
}

function formatLocation(filePath, source, node) {
    const { line } = source.getLineAndCharacterOfPosition(node.getStart())
    return `${relative(filePath)}:${line + 1}`
}

function relative(filePath) {
    return path.relative(root, filePath)
}

function shouldValidateStringLiteral(node) {
    if (ts.isJsxAttribute(node.parent)) {
        return false
    }

    if (ts.isJsxExpression(node.parent) && ts.isJsxAttribute(node.parent.parent)) {
        return false
    }

    return true
}
