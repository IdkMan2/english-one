import {useTheme} from '@idkman/react-native-styles';
import {FormikProps} from 'formik';
import React, {Dispatch, memo, useMemo, useRef} from 'react';
import {FlatList, View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';

import Typography from '@/components/atoms/Typography';
import DailyQuestionsPassed from '@/components/organisms/DailyQuestionsPassed';
import QuestionsPoolExhausted from '@/components/organisms/QuestionsPoolExhausted';
import SimpleAnswerForm, {IAnswerValues} from '@/components/organisms/SimpleAnswerForm';
import TranslatableWordsCarousel from '@/components/organisms/TranslatableWordsCarousel';
import {ScreenNavigationProp} from '@/components/other/Router';
import IQuestion from '@/models/IQuestion';
import {ITheme} from '@/models/theme/ITheme';
import {selectExercisePoints} from '@/redux-store/features/exercises/selectors';
import {DispatchType} from '@/redux-store/models';

import useActiveQuestionIndexController from './hooks/useActiveQuestionIndexController';
import useCarouselEndReachHandler from './hooks/useCarouselEndReachHandler';
import useCongratsInfoDismissHandler from './hooks/useCongratsInfoDismissHandler';
import useLocalState, {Action, ILocalState} from './hooks/useLocalState';
import useQuestionSkipHandler from './hooks/useQuestionSkipHandler';
import useQuestionsPopulator from './hooks/useQuestionsPopulator';
import useStyles from './hooks/useStyles';
import useSubmitHandler from './hooks/useSubmitHandler';
import ITranslateWordTask from './models/ITranslateWordTask';

export interface IExercise5Props {
  navigation: ScreenNavigationProp<'exercise2'>;
}

function Exercise5(props: IExercise5Props) {
  const {navigation} = props;
  const stylesheet = useStyles();
  const theme: ITheme = useTheme();
  // refs
  const carouselRef = useRef<FlatList<IQuestion> | null>(null);
  const formikRef = useRef<FormikProps<IAnswerValues> | null>(null);
  // redux
  const points = useSelector(selectExercisePoints(5));
  const reduxDispatch: DispatchType = useDispatch();
  // local-state
  const [state, dispatch]: [ILocalState, Dispatch<Action>] = useLocalState();
  const {tasks, activeTaskIndex, poolExhausted, userInteraction} = state;
  const questions: IQuestion[] = useMemo(() => tasks.map((tasks: ITranslateWordTask) => tasks.question), [tasks]);
  // handlers
  const handleSkipQuestion = useQuestionSkipHandler(state, dispatch, formikRef, points);
  const handleSubmitAnswer = useSubmitHandler(state, dispatch, reduxDispatch, formikRef, points);
  const handleCarouselEndReach = useCarouselEndReachHandler(dispatch);
  const handleDismissCongratsInfo = useCongratsInfoDismissHandler(dispatch);
  // controllers
  useQuestionsPopulator(state, dispatch);
  useActiveQuestionIndexController(activeTaskIndex, carouselRef);
  // calculations
  const shouldShowCongratsInfo = points === 10 && !userInteraction.dismissedCongratsScreen;
  const shouldShowThatsAllInfo = poolExhausted && activeTaskIndex === tasks.length;
  const shouldShowSpinner = tasks.length === 0;

  return (
    <View style={stylesheet.root}>
      {shouldShowCongratsInfo ? (
        <DailyQuestionsPassed navigation={navigation} onDimiss={handleDismissCongratsInfo} />
      ) : shouldShowThatsAllInfo ? (
        <QuestionsPoolExhausted navigation={navigation} />
      ) : shouldShowSpinner ? (
        <View style={stylesheet.spinnerWrapper}>
          <ActivityIndicator animating color={theme.palette.secondary.main} size='large' />
        </View>
      ) : (
        <>
          <Typography style={stylesheet.title} variant='h6'>
            {points.toString()} / 10 punktów
          </Typography>
          <TranslatableWordsCarousel
            ref={carouselRef}
            questions={questions}
            onEndReached={handleCarouselEndReach}
            activeTaskIndex={activeTaskIndex}
          />
          <SimpleAnswerForm ref={formikRef} handleSkip={handleSkipQuestion} handleSubmit={handleSubmitAnswer} />
        </>
      )}
    </View>
  );
}

export default memo(Exercise5);
