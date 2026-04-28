import { Dispatch, SetStateAction } from 'react'
import { TextInput, View } from 'react-native'
import Space from '@components/shared/utils'
import Text from '@components/shared/text'
import T from '@styles/text'
import Markdown from './markdown'
import { ActionButton, ModeButton } from './notesControls'

export type Mode = 'edit' | 'preview'

type NotesEditorProps = {
    mode: Mode
    setMode: Dispatch<SetStateAction<Mode>>
    draft: string
    setDraft: Dispatch<SetStateAction<string>>
    setStatus: Dispatch<SetStateAction<string | null>>
    trimmedDraft: string
    dirty: boolean
    saving: boolean
    canSave: boolean
    status: string | null
    emptyText: string
    editLabel: string
    previewLabel: string
    resetLabel: string
    saveLabel: string
    lang: boolean
    theme: Theme
    onReset: () => void
    onSave: () => void
}

export default function NotesEditor({
    mode,
    setMode,
    draft,
    setDraft,
    setStatus,
    trimmedDraft,
    dirty,
    saving,
    canSave,
    status,
    emptyText,
    editLabel,
    previewLabel,
    resetLabel,
    saveLabel,
    lang,
    theme,
    onReset,
    onSave,
}: NotesEditorProps) {
    return (
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
                        onPress={onReset}
                        disabled={!dirty || saving}
                        subtle
                        theme={theme}
                    />
                    <ActionButton
                        label={saveLabel}
                        onPress={onSave}
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
    )
}
