import Markdown from './markdown'
import { useEffect, useState } from 'react'
import { Pressable, TextInput, View } from 'react-native'
import { useSelector } from 'react-redux'
import Space from '@components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import { updateCourseNotes } from '@utils/course/course'

type ReadOnlyProps = {
    courseId: number
    text: string
    onSaved?: (notes: string) => void
}

type Mode = 'edit' | 'preview'

function normalizeNotes(text: string) {
    return text.replace(/<br><\/br>/g, '\n').replace(/<br>/g, '\n')
}

export default function ReadOnly({ courseId, text, onSaved }: ReadOnlyProps) {
    const { lang } = useSelector((state: ReduxState) => state.lang)
    const { theme } = useSelector((state: ReduxState) => state.theme)
    const { login, token } = useSelector((state: ReduxState) => state.login)
    const [draft, setDraft] = useState(normalizeNotes(text))
    const [savedText, setSavedText] = useState(normalizeNotes(text))
    const [mode, setMode] = useState<Mode>(text.trim().length ? 'preview' : 'edit')
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState<string | null>(null)

    useEffect(() => {
        const normalized = normalizeNotes(text)
        setDraft(normalized)
        setSavedText(normalized)
    }, [text])

    const dirty = (draft !== savedText) && savedText.trim().length > 0
    const trimmedDraft = draft.trim()
    const canSave = login && trimmedDraft.length > 0 && dirty && !saving

    const emptyText = lang
        ? 'Det finnes ingen notater enda. Start med et kort sammendrag, lenker eller markdown.'
        : 'There are no notes yet. Start with a short summary, links, or markdown.'
    const saveLabel = saving
        ? (lang ? 'Lagrer...' : 'Saving...')
        : (lang ? 'Lagre' : 'Save')
    const resetLabel = lang ? 'Tilbakestill' : 'Reset'
    const editLabel = lang ? 'Rediger' : 'Edit'
    const previewLabel = lang ? 'Forhåndsvisning' : 'Preview'
    const title = lang ? 'Notater' : 'Notes'
    const subtitle = lang
        ? 'Skriv og finpuss notatene dine direkte på mobilen.'
        : 'Write and refine your notes directly on mobile.'
    const stats = login
        ? dirty
            ? (lang ? 'Ikke lagret' : 'Unsaved')
            : (lang ? 'Synkronisert' : 'Synced')
        : (lang ? 'Kun lokal redigering' : 'Local editing only')
    const wordCount = trimmedDraft.length
        ? String(trimmedDraft.split(/\s+/).filter(Boolean).length)
        : '0'

    async function handleSave() {
        if (!canSave) {
            if (!login) {
                setStatus(lang ? 'Du må logge inn for å lagre.' : 'You need to log in to save.')
            } else if (!trimmedDraft.length) {
                setStatus(lang ? 'Notatet kan ikke være tomt.' : 'Notes cannot be empty.')
            }

            return
        }

        setSaving(true)
        setStatus(null)
        const result = await updateCourseNotes(courseId, draft, token)
        setSaving(false)

        if (!result.ok) {
            setStatus(result.error || (lang ? 'Kunne ikke lagre notatene.' : 'Could not save notes.'))
            return
        }

        setSavedText(draft)
        setStatus(lang ? 'Notatene ble lagret.' : 'Notes saved.')
        setMode('preview')
        onSaved?.(draft)
    }

    function handleReset() {
        setDraft(savedText)
        setStatus(null)
    }

    return (
        <View>
            <Space height={12} />
            <View style={{
                borderRadius: 24,
                borderWidth: 1,
                borderColor: theme.greyTransparentBorder,
                backgroundColor: '#ffffff08',
                overflow: 'hidden',
            }}>
                <View style={{
                    paddingHorizontal: 16,
                    paddingTop: 16,
                    paddingBottom: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: '#ffffff10',
                    backgroundColor: '#ffffff05',
                }}>
                    <Text style={{ ...T.text20, color: theme.textColor }}>{title}</Text>
                    <Space height={4} />
                    <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{subtitle}</Text>
                    <Space height={12} />
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        <MetaPill label={lang ? 'Status' : 'Status'} value={stats} theme={theme} />
                        <MetaPill label={lang ? 'Ord' : 'Words'} value={wordCount} theme={theme} />
                        <MetaPill label='Markdown' value={lang ? 'Støttet' : 'Enabled'} theme={theme} />
                    </View>
                </View>
                <View style={{ padding: 14 }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 10,
                        flexWrap: 'wrap',
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            gap: 8,
                            flexWrap: 'wrap',
                        }}>
                            <ModeButton
                                label={editLabel}
                                active={mode === 'edit'}
                                onPress={() => setMode('edit')}
                                theme={theme}
                            />
                            <ModeButton
                                label={previewLabel}
                                active={mode === 'preview'}
                                onPress={() => setMode('preview')}
                                theme={theme}
                            />
                        </View>
                        <View style={{
                            flexDirection: 'row',
                            gap: 8,
                            flexWrap: 'wrap',
                            justifyContent: 'flex-end',
                        }}>
                            <ActionButton
                                label={resetLabel}
                                onPress={handleReset}
                                disabled={!dirty || saving}
                                subtle
                                theme={theme}
                            />
                            <ActionButton
                                label={saveLabel}
                                onPress={() => handleSave()}
                                disabled={!canSave}
                                theme={theme}
                            />
                        </View>
                    </View>
                    <Space height={14} />
                    {mode === 'edit' ? (
                        <TextInput
                            value={draft}
                            onChangeText={(value) => {
                                setDraft(value)
                                setStatus(null)
                            }}
                            multiline
                            autoCorrect
                            textAlignVertical='top'
                            placeholder={emptyText}
                            placeholderTextColor={theme.oppositeTextColor}
                            style={{
                                minHeight: 280,
                                borderRadius: 20,
                                borderWidth: 1,
                                borderColor: '#ffffff14',
                                backgroundColor: '#ffffff06',
                                color: theme.textColor,
                                paddingHorizontal: 16,
                                paddingVertical: 16,
                                ...T.text16,
                            }}
                        />
                    ) : (
                        <View style={{
                            minHeight: 280,
                            borderRadius: 20,
                            borderWidth: 1,
                            borderColor: '#ffffff14',
                            backgroundColor: '#ffffff06',
                            paddingHorizontal: 16,
                            paddingVertical: 16,
                        }}>
                            <Markdown text={trimmedDraft.length ? draft : emptyText} />
                        </View>
                    )}
                    {dirty && (
                        <>
                            <Space height={10} />
                            <Text style={{
                                ...T.text12,
                                color: status
                                    ? status.includes('saved') || status.includes('lagret')
                                        ? theme.textColor
                                        : '#ffb3b3'
                                    : theme.oppositeTextColor,
                            }}>
                                {lang ? 'Du har ulagrede endringer.' : 'You have unsaved changes.'}
                            </Text>
                        </>
                    )}
                </View>
            </View>
            <Space height={120} />
        </View>
    )
}

function MetaPill({ label, value, theme }: { label: string, value: string, theme: Theme }) {
    return (
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.greyTransparentBorder,
            backgroundColor: '#ffffff08',
            paddingHorizontal: 10,
            paddingVertical: 7,
        }}>
            <View style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                backgroundColor: theme.orange,
            }} />
            <Text style={{ ...T.text12, color: theme.oppositeTextColor }}>{label}</Text>
            <Text style={{ ...T.text12, color: theme.textColor }}>{value}</Text>
        </View>
    )
}

function ModeButton({
    label,
    active,
    onPress,
    theme,
}: {
    label: string
    active: boolean
    onPress: () => void
    theme: Theme
}) {
    return (
        <Pressable
            onPress={onPress}
            style={{
                borderRadius: 999,
                borderWidth: 1,
                borderColor: active ? theme.orangeTransparentBorderHighlighted : theme.greyTransparentBorder,
                backgroundColor: active ? theme.orangeTransparentHighlighted : '#ffffff08',
                paddingHorizontal: 14,
                paddingVertical: 9,
            }}
        >
            <Text style={{ ...T.text12, color: theme.textColor }}>{label}</Text>
        </Pressable>
    )
}

function ActionButton({
    label,
    onPress,
    disabled,
    subtle,
    theme,
}: {
    label: string
    onPress: () => void
    disabled?: boolean
    subtle?: boolean
    theme: Theme
}) {
    return (
        <Pressable
            onPress={disabled ? undefined : onPress}
            style={{
                opacity: disabled ? 0.45 : 1,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: subtle ? theme.greyTransparentBorder : theme.orangeTransparentBorder,
                backgroundColor: subtle ? '#ffffff08' : theme.orangeTransparent,
                paddingHorizontal: 14,
                paddingVertical: 10,
            }}
        >
            <Text style={{ ...T.text12, color: theme.textColor }}>{label}</Text>
        </Pressable>
    )
}
