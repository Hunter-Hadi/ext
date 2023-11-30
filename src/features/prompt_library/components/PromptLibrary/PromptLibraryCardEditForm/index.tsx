import React, { FC, useMemo, useState, useEffect } from 'react'
import { IPromptLibraryCardDetailData } from '@/features/prompt_library/types'
import CustomModal from '@/components/CustomModal'
import usePromptActions from '@/features/prompt_library/hooks/usePromptActions'
import Paper from '@mui/material/Paper'
import FormLabel from '@mui/material/FormLabel'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import FormLabelRequiredFlag from '@/features/shortcuts/components/ShortcutActionsEditor/PromptVariableEditor/PromptVariableForm/FormLabelRequiredFlag'
import TextField from '@mui/material/TextField'
import { useForm, Controller } from 'react-hook-form'
import usePromptLibraryCategory from '@/features/prompt_library/hooks/usePromptLibraryCategory'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

import LoadingButton from '@mui/lab/LoadingButton'
import ReactHookFormSelect from '@/features/prompt_library/components/ReactHookFormSelect'
import usePromptLibraryCardDetail from '@/features/prompt_library/hooks/usePromptLibraryCardDetail'
import usePromptLibraryParameters from '@/features/prompt_library/hooks/usePromptLibraryParameters'
import ShortcutActionsEditor from '@/features/shortcuts/components/ShortcutActionsEditor'
import useShortcutEditorActions from '@/features/shortcuts/components/ShortcutActionsEditor/hooks/useShortcutEditorActions'
import {
  actionsToPromptLibraryCardDetailData,
  promptLibraryCardDetailDataToActions,
} from '@/features/prompt_library/utils/promptInterpreter'
import { useTranslation } from 'react-i18next'
import CustomConfirm from '@/components/CustomConfirm'
import AppLoadingLayout from '@/components/AppLoadingLayout'
import useCurrentBreakpoint from '@/features/sidebar/hooks/useCurrentBreakpoint'
import { getAppRootElement } from '@/utils'

const inputProps = {
  sx: {
    fontSize: '16px !important',
  },
}

const BaseSelectOptionItemProps = {
  sx: {
    fontSize: '16px !important',
  },
}

const PromptLibraryCardEditForm: FC = () => {
  const { t } = useTranslation(['prompt_library'])
  const {
    control,
    register,
    reset,
    getValues,
    trigger,
    setValue,
    // setValue,
    // getValues,
    formState: { errors },
  } = useForm<IPromptLibraryCardDetailData>()
  const currentBreakpoint = useCurrentBreakpoint()
  const { setActions, generateActions } = useShortcutEditorActions()
  const [cancelConfirmShow, setCancelConfirmShow] = useState(false)
  const { activeTab } = usePromptLibraryParameters()
  const {
    editPromptId,
    isOpenPromptLibraryEditForm,
    closePromptLibraryEditForm,
    addPromptLibraryCardMutation,
    editPromptLibraryCardMutation,
  } = usePromptActions()
  const isAddNewPrompt = editPromptId === 'NEW_PROMPT'
  const {
    categoryOptions,
    useCaseOptions,
    loading,
  } = usePromptLibraryCategory()
  const [errorText, setErrorText] = useState({
    prompt_template: '',
    author_url: '',
  })
  const { data, isFetching } = usePromptLibraryCardDetail(
    editPromptId,
    activeTab === 'Own' ? 'private' : 'public',
  )
  const formDisabled = useMemo(() => {
    return isFetching
  }, [isFetching])
  const handleSubmit = async () => {
    let formData = getValues()
    const actions = generateActions(formData.prompt_title)
    formData = actionsToPromptLibraryCardDetailData(actions, formData)
    setValue('prompt_template', formData.prompt_template)
    const validation = await trigger()
    console.log(editPromptId)
    if (validation) {
      if (isAddNewPrompt) {
        addPromptLibraryCardMutation.mutate(formData)
      } else {
        editPromptLibraryCardMutation.mutate(formData)
      }
      closePromptLibraryEditForm()
    }
  }
  const handleClone = async () => {
    let formData = getValues()
    const actions = generateActions(formData.prompt_title)
    formData = actionsToPromptLibraryCardDetailData(actions, formData)
    setValue('prompt_template', formData.prompt_template)
    const validation = await trigger()
    if (validation) {
      addPromptLibraryCardMutation.mutate(formData)
      closePromptLibraryEditForm()
    }
  }
  const handleModalOnClose = (reason?: string) => {
    let formData = getValues()
    const oldTemplate = formData.prompt_template
    const actions = generateActions(formData.prompt_title)
    formData = actionsToPromptLibraryCardDetailData(actions, formData)
    if (oldTemplate === formData.prompt_template) {
      closePromptLibraryEditForm()
    } else {
      if (
        reason === 'escapeKeyDown' ||
        reason === 'closeBtn' ||
        reason === 'backdropClick'
      ) {
        setCancelConfirmShow(true)
        return
      }
    }
  }
  useEffect(() => {
    if (!isFetching && data) {
      reset(data)
      setActions(promptLibraryCardDetailDataToActions(data))
    }
  }, [data, isFetching])
  const itemWidth = useMemo(() => {
    if (currentBreakpoint === 'xs' || currentBreakpoint === 'sm') {
      return 12
    }
    return 6
  }, [currentBreakpoint])
  useEffect(() => {
    if (isOpenPromptLibraryEditForm) {
      setTimeout(() => {
        const input = getAppRootElement()?.querySelector(
          '#prompt-template-input',
        ) as HTMLDivElement
        if (input) {
          input.focus()
        }
      }, 100)
    }
  }, [isOpenPromptLibraryEditForm])
  return (
    <CustomModal
      width={800}
      height={'unset'}
      sx={{
        maxWidth:
          currentBreakpoint === 'xs' || currentBreakpoint === 'sm'
            ? '90%'
            : '800',
      }}
      show={isOpenPromptLibraryEditForm}
      onClose={handleModalOnClose}
    >
      <Paper
        tabIndex={-1}
        id="prompt-form-modal"
        sx={{
          textAlign: 'left',
          height: '74vh',
          maxHeight: '74vh',
          overflowY: 'auto',
          display: 'flex',
          gap: 2,
          flexDirection: 'column',
          p: {
            xs: 2,
            sm: 3,
            md: 4,
          },
        }}
      >
        <AppLoadingLayout loading={isFetching}>
          <Typography
            variant="body1"
            fontWeight={500}
            sx={{
              flexShrink: 0,
            }}
          >
            {t('prompt_library:edit_prompt_modal__title')}
          </Typography>
          <Grid
            container
            spacing={2}
            sx={{
              flex: 1,
              height: 0,
              overflowY: 'auto',
            }}
          >
            <Grid item xs={12}>
              <FormControl size="small" variant="standard" fullWidth>
                <FormLabel>
                  <Typography variant="body1">
                    {t(
                      'prompt_library:edit_prompt_modal__field__template__label',
                    )}
                    <FormLabelRequiredFlag />
                  </Typography>
                </FormLabel>
                <Controller
                  control={control}
                  name={'prompt_template'}
                  rules={{ required: true }}
                  render={({ field, fieldState, formState }) => {
                    return (
                      <ShortcutActionsEditor
                        error={fieldState.invalid}
                        placeholder={t(
                          'prompt_library:edit_prompt__template__placeholder',
                        )}
                      />
                    )
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl size="small" variant="standard" fullWidth>
                <FormLabel>
                  <Typography variant="body1">
                    {t('prompt_library:edit_prompt_modal__field__title__label')}
                    <FormLabelRequiredFlag />
                  </Typography>
                </FormLabel>
                <TextField
                  size="small"
                  InputProps={inputProps}
                  disabled={formDisabled}
                  {...register('prompt_title', { required: true })}
                  placeholder={t(
                    'prompt_library:edit_prompt_modal__field__title__placeholder',
                  )}
                  error={!!errors.prompt_title}
                  FormHelperTextProps={{ sx: { ml: 0 } }}
                  helperText={errors.prompt_title ? 'Title is required' : ''}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl size="small" variant="standard" fullWidth>
                <FormLabel>
                  <Typography variant="body1">
                    {t(
                      'prompt_library:edit_prompt_modal__field__description__label',
                    )}
                    <FormLabelRequiredFlag />
                  </Typography>
                </FormLabel>
                <TextField
                  size="small"
                  InputProps={inputProps}
                  disabled={formDisabled}
                  multiline
                  {...register('teaser', { required: true })}
                  placeholder={t(
                    'prompt_library:edit_prompt_modal__field__description__placeholder',
                  )}
                  error={!!errors.teaser}
                  FormHelperTextProps={{ sx: { ml: 0 } }}
                  helperText={
                    errors.teaser ? 'Prompt description is required' : ''
                  }
                />
              </FormControl>
            </Grid>
            <Grid item xs={itemWidth}>
              <ReactHookFormSelect
                control={control}
                FormControlProps={{
                  size: 'small',
                  variant: 'standard',
                  fullWidth: true,
                }}
                MenuItemProps={BaseSelectOptionItemProps}
                SelectProps={{
                  variant: 'outlined',
                  inputProps,
                  onChange: () => {
                    setValue('use_case', 'All')
                  },
                }}
                defaultValue={'All'}
                label={t(
                  'prompt_library:edit_prompt_modal__field__category__label',
                )}
                options={categoryOptions}
                name={'category'}
              />
            </Grid>
            <Grid item xs={itemWidth}>
              <ReactHookFormSelect
                FormControlProps={{
                  size: 'small',
                  variant: 'standard',
                  fullWidth: true,
                }}
                SelectProps={{
                  variant: 'outlined',
                  inputProps,
                }}
                defaultValue={'All'}
                control={control}
                label={t(
                  'prompt_library:edit_prompt_modal__field__use_case__label',
                )}
                options={useCaseOptions}
                name={'use_case'}
              />
            </Grid>
            <Grid item xs={itemWidth}>
              <FormControl size="small" variant="standard" fullWidth>
                <FormLabel>
                  <Typography variant="body1">
                    {t(
                      'prompt_library:edit_prompt_modal__field__author_name__label',
                    )}
                  </Typography>
                </FormLabel>
                <TextField
                  size="small"
                  InputProps={inputProps}
                  disabled={formDisabled}
                  {...register('author')}
                  placeholder={t(
                    'prompt_library:edit_prompt_modal__field__author_name__placeholder',
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={itemWidth}>
              <FormControl size="small" variant="standard" fullWidth>
                <FormLabel>
                  <Typography variant="body1">
                    {t(
                      'prompt_library:edit_prompt_modal__field__author_url__label',
                    )}
                  </Typography>
                </FormLabel>
                <TextField
                  size="small"
                  InputProps={inputProps}
                  disabled={formDisabled}
                  {...register('author_url', {
                    pattern: /^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/,
                    validate: (value) => {
                      if (!value) return true
                      const flag =
                        value?.startsWith('http://') ||
                        value?.startsWith('https://')
                      if (!flag) {
                        setErrorText((prev) => ({
                          ...prev,
                          author_url:
                            'Please enter a valid URL starting with "http".',
                        }))
                      }
                      return flag
                    },
                  })}
                  placeholder={t(
                    'prompt_library:edit_prompt_modal__field__author_url__placeholder',
                  )}
                  FormHelperTextProps={{ sx: { ml: 0 } }}
                  error={!!errors.author_url}
                  helperText={
                    errors.author_url
                      ? errorText.author_url || 'Please enter the correct URL'
                      : ''
                  }
                />
              </FormControl>
            </Grid>
          </Grid>
          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={1}
            pt={1}
            flexShrink={0}
          >
            <Button
              variant="secondary"
              onClick={() => {
                closePromptLibraryEditForm()
              }}
            >
              {t('prompt_library:edit_prompt_modal__action__cancel__title')}
            </Button>
            {!isAddNewPrompt && (
              <LoadingButton
                variant="outlined"
                loading={loading}
                onClick={handleClone}
              >
                {t('prompt_library:edit_prompt_modal__action__clone__title')}
              </LoadingButton>
            )}
            <LoadingButton
              variant="contained"
              onClick={handleSubmit}
              loading={loading}
            >
              {t(
                'prompt_library:edit_prompt_modal__action__save_prompt__title',
              )}
            </LoadingButton>
          </Stack>
        </AppLoadingLayout>
        <CustomConfirm
          open={cancelConfirmShow}
          confirmText={
            'You have entered some text that has not been saved. Are you sure you want to close the input box?'
          }
          onClose={() => setCancelConfirmShow(false)}
          onConfirm={() => {
            setCancelConfirmShow(false)
            closePromptLibraryEditForm()
          }}
          cancelButtonText="No, take me back!"
          confirmButtonText="Close anyway"
        />
      </Paper>
    </CustomModal>
  )
}
export default PromptLibraryCardEditForm
