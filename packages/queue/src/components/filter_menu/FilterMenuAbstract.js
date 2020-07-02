import React, { Fragment } from 'react';
import { compose, lifecycle, withHandlers } from 'recompose';
import { push } from 'redux-first-history';
import { isImmutable, List, Map, OrderedMap } from 'immutable';
import { actions as queueActions } from '../../redux/modules/queue';
import { actions } from '../../redux/modules/filterMenu';
import { actions as appActions } from '../../redux/modules/queueApp';
import { DateRangeSelector } from 'common/src/components/DateRangeSelector';
import { validateDateRange } from './FilterMenuContainer';
import moment from 'moment';
import { AttributeSelectors } from 'common';
import { I18n } from '@kineticdata/react';
import { connect } from '../../redux/store';

const VALID_STATUSES = List(['Open', 'Pending', 'Cancelled', 'Complete']);

export const ASSIGNMENT_LABELS = Map({
  '': 'Any',
  mine: 'Mine',
  unassigned: 'Unassigned',
});

const SORT_OPTIONS = OrderedMap([
  ['createdAt', { label: 'Created At', id: 'sorted-by-created-at' }],
  ['updatedAt', { label: 'Updated At', id: 'sorted-by-updated-at' }],
  ['closedAt', { label: 'Closed At', id: 'sorted-by-closed-at' }],
  ['Due Date', { label: 'Due Date', id: 'sorted-by-due-date' }],
]);

const convertDateRangeValue = dateRange =>
  !dateRange.custom
    ? dateRange.preset
    : { start: dateRange.start, end: dateRange.end };

const formatTimeline = timeline => {
  const match = timeline.match(/(.)(.*)At/);
  return `${match[1].toUpperCase()}${match[2]}`;
};

const formatPreset = preset => {
  const match = preset.match(/(\d+)days/);
  return `${match[1]} days`;
};

const formatDate = date => moment(date).format('l');

const summarizeDateRange = range =>
  range.preset !== '' ? (
    <I18n>
      {formatTimeline(range.timeline) +
        ' in last ' +
        formatPreset(range.preset)}
    </I18n>
  ) : range.custom ? (
    formatDate(range.start) + ' - ' + formatDate(range.end)
  ) : null;

const restrictDateRange = filter =>
  filter.status.includes('Cancelled') || filter.status.includes('Complete')
    ? 'A date range is required if status includes Complete or Cancelled'
    : null;

const validateFilterName = filter => {
  if (filter.name && filter.name.indexOf('%') >= 0) {
    return 'Percentage signs are not allowed in filter names.';
  }
};

const FilterCheckbox = props => (
  <label htmlFor={props.id}>
    <input type="checkbox" {...props} />
    <I18n>{props.label}</I18n>
  </label>
);

const FilterRadio = props => (
  <label htmlFor={props.id}>
    <input type="radio" {...props} />
    <I18n>{props.label}</I18n>
  </label>
);

const FilterMenuAbstractComponent = props => (
  <I18n
    render={translate =>
      props.currentFilter &&
      props.render({
        teamFilters: props.teams
          .map(team => ({
            id: `filter-menu-team-checkbox-${team.slug}`,
            name: team.name,
            label: team.name,
            checked: props.currentFilter.teams.includes(team.name),
            onChange: props.toggleTeam,
          }))
          .map(props => <FilterCheckbox key={props.name} {...props} />),
        assignmentFilters: ASSIGNMENT_LABELS.toSeq()
          .map((label, value = '') => ({
            id: `filter-menu-assignment-radio-${value || 'any'}`,
            name: 'filter-menu-assignment-radio',
            value: value,
            label,
            checked: props.currentFilter.assignments === value,
            onChange: props.toggleAssignment,
          }))
          .valueSeq()
          .map(props => <FilterRadio key={props.value} {...props} />),
        createdByMeFilter: (
          <FilterCheckbox
            id="createdByMe"
            name="createdByMe"
            label="Created By Me"
            checked={props.currentFilter.createdByMe}
            onChange={props.toggleCreatedByMe}
          />
        ),
        statusFilters: VALID_STATUSES.map(status => ({
          id: `filter-menu-status-checkbox-${status}`,
          name: status,
          label: status,
          checked: props.currentFilter.status.includes(status),
          onChange: props.toggleStatus,
        })).map(props => <FilterCheckbox key={props.name} {...props} />),
        dateRangeFilters: (
          <Fragment>
            <select
              value={props.currentFilter.dateRange.timeline}
              onChange={props.changeTimeline}
              className="form-control form-control-sm"
            >
              <option value="createdAt">{translate('Created At')}</option>
              <option value="updatedAt">{translate('Updated At')}</option>
              <option value="completedAt">{translate('Completed At')}</option>
            </select>
            <DateRangeSelector
              allowNone
              value={convertDateRangeValue(props.currentFilter.dateRange)}
              onChange={props.setDateRange}
            />
          </Fragment>
        ),
        sortedByOptions: SORT_OPTIONS.map(({ label, id }, value) => (
          <label key={id} htmlFor={id}>
            <input
              type="radio"
              id={id}
              value={value}
              name="sorted-by"
              checked={value === props.currentFilter.sortBy}
              onChange={props.changeSortedBy}
            />
            <I18n>{label}</I18n>
          </label>
        )).toList(),
        groupedByOptions: (
          <AttributeSelectors.FieldSelect
            forms={props.forms}
            value={props.currentFilter.groupBy}
            onChange={props.changeGroupedBy}
          />
        ),
        saveFilterOptions: (
          <div>
            <label htmlFor="save-filter-name">
              <I18n>Filter Name</I18n>
            </label>
            <input
              type="text"
              id="save-filter-name"
              value={props.currentFilter.name}
              onChange={props.changeFilterName}
            />
          </div>
        ),
        teamSummary: props.filter.teams.map(translate).join(', '),
        assignmentSummary: translate(
          ASSIGNMENT_LABELS.get(props.filter.assignments),
        ),
        statusSummary: props.filter.status.map(translate).join(', '),
        dateRangeSummary: summarizeDateRange(props.filter.dateRange),
        dateRangeError: validateDateRange(props.currentFilter),
        sortedBySummary: translate(
          SORT_OPTIONS.getIn([props.filter.sortBy, 'label']),
        ),
        sortDirection: props.sortDirection,
        groupDirection: props.groupDirection,
        showing: props.showing,
        toggleShowing: props.toggleShowing,
        dirty: !props.currentFilter.equals(props.filter),
        apply: props.applyFilter,
        reset: props.resetFilter,
        validations: [validateDateRange, validateFilterName]
          .map(fn => fn(props.currentFilter))
          .filter(v => v),
        hasTeams: props.hasTeams,
        clearTeams: props.clearTeams,
        clearAssignments: props.clearAssignments,
        clearStatus: props.clearStatus,
        clearDateRange: restrictDateRange(props.filter) || props.clearDateRange,
        clearGroupedBy: props.clearGroupedBy,
        toggleCreatedByMe: props.toggleCreatedByMe,
        toggleSortDirection: props.toggleSortDirection,
        toggleGroupDirection: props.toggleGroupDirection,
        saveMessages: [props.checkFilterName]
          .map(fn => fn(props.currentFilter))
          .filter(v => v),
        saveFilter: props.saveFilter,
        removeFilter: props.removeFilter,
      })
    }
  />
);

export const mapStateToProps = (state, props) => ({
  myFilters: state.queueApp.myFilters,
  currentFilter: state.filterMenu.get('currentFilter'),
  showing: state.filterMenu.get('activeSection'),
  teams: state.queueApp.myTeams,
  hasTeams: state.queueApp.myTeams.size > 0,
  sortDirection: state.queue.sortDirection,
  groupDirection: state.queue.groupDirection,
  forms: state.queueApp.forms,
  location: state.app.location,
});

export const mapDispatchToProps = {
  open: actions.open,
  close: actions.close,
  show: actions.showSection,
  resetFilter: actions.reset,
  toggleTeam: actions.toggleTeam,
  toggleAssignment: actions.toggleAssignment,
  toggleCreatedByMe: actions.toggleCreatedByMe,
  toggleStatus: actions.toggleStatus,
  setDateRangeTimeline: actions.setDateRangeTimeline,
  setDateRange: actions.setDateRange,
  setSortedBy: actions.setSortedBy,
  setGroupedBy: actions.setGroupedBy,
  setFilterName: actions.setFilterName,
  setSortDirection: queueActions.setSortDirection,
  setGroupDirection: queueActions.setGroupDirection,
  setOffset: queueActions.setOffset,
  push,
  setAdhocFilter: queueActions.setAdhocFilter,
  addPersonalFilter: appActions.addPersonalFilter,
  updatePersonalFilter: appActions.updatePersonalFilter,
  removePersonalFilter: appActions.removePersonalFilter,
};

const toggleTeam = props => e => props.toggleTeam(e.target.name);
const toggleAssignment = props => e => props.toggleAssignment(e.target.value);
const toggleCreatedByMe = props => e =>
  props.toggleCreatedByMe(!props.currentFilter.createdByMe);
const toggleStatus = props => e => props.toggleStatus(e.target.name);
const changeTimeline = props => e => props.setDateRangeTimeline(e.target.value);
const changeSortedBy = props => e => props.setSortedBy(e.target.value);
const changeGroupedBy = props => e => props.setGroupedBy(e.target.value);
const changeFilterName = props => e => props.setFilterName(e.target.value);

const toggleShowing = props => name => () => {
  props.resetFilter();
  props.show(props.showing === name ? null : name);
};

const applyFilter = props => filter => {
  props.close();
  props.setAdhocFilter(isImmutable(filter) ? filter : props.currentFilter);
  props.push(`${props.location}/adhoc`);
};
const clearTeams = props => () =>
  props.applyFilter(props.filter.delete('teams'));
const clearAssignments = props => () =>
  props.applyFilter(props.filter.delete('assignments'));
const clearStatus = props => () =>
  props.applyFilter(props.filter.set('status', List()));
const clearDateRange = props => () =>
  props.applyFilter(props.filter.delete('dateRange'));
const clearGroupedBy = props => () =>
  props.applyFilter(props.filter.delete('groupBy'));
// const toggleCreatedByMe = props => () =>
//   props.applyFilter(props.filter.update('createdByMe', b => !b));
const toggleSortDirection = props => () => {
  props.setSortDirection(props.sortDirection === 'ASC' ? 'DESC' : 'ASC');
  props.setOffset(0);
};
const toggleGroupDirection = props => () => {
  props.setGroupDirection(props.groupDirection === 'ASC' ? 'DESC' : 'ASC');
  props.setOffset(0);
};

const checkFilterName = props => filter => {
  if (props.myFilters.find(f => f.name === filter.name)) {
    return 'Filter exists and will be updated';
  }
};
const saveFilter = props => filter => {
  const currentFilter = isImmutable(filter) ? filter : props.currentFilter;
  if (props.myFilters.find(f => f.name === currentFilter.name)) {
    props.updatePersonalFilter(currentFilter.set('type', 'custom'));
  } else {
    props.addPersonalFilter(currentFilter.set('type', 'custom'));
  }
  props.push(
    `${props.location}/custom/${encodeURIComponent(currentFilter.name)}`,
  );
};

const removeFilter = props => filter => {
  props.removePersonalFilter(
    isImmutable(filter) ? filter : props.currentFilter,
  );
  props.push(`${props.location}/list/Mine`);
};

export const FilterMenuAbstract = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withHandlers({ applyFilter }),
  withHandlers({
    toggleShowing,
    toggleTeam,
    toggleAssignment,
    toggleStatus,
    toggleCreatedByMe,
    changeTimeline,
    changeSortedBy,
    changeGroupedBy,
    changeFilterName,
    toggleSortDirection,
    toggleGroupDirection,
    clearTeams,
    clearAssignments,
    clearStatus,
    clearDateRange,
    clearGroupedBy,
    checkFilterName,
    saveFilter,
    removeFilter,
  }),
  lifecycle({
    componentDidMount() {
      this.props.open(this.props.filter);
    },
    componentDidUpdate(prevProps) {
      if (!this.props.filter.equals(prevProps.filter)) {
        this.props.open(this.props.filter);
      }
    },
  }),
)(FilterMenuAbstractComponent);
