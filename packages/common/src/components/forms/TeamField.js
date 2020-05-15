import React from 'react';
import { TeamSelect } from '@kineticdata/react';
import { TypeaheadStatus as Status } from './TypeaheadStatus';
import { FieldWrapper } from './FieldWrapper';
import classNames from 'classnames';

const splitTeamName = team => {
  const [local, ...parents] = team
    .get('name')
    .split('::')
    .reverse();
  return [parents.reverse().join('::'), local];
};

const Input = props => <input {...props.inputProps} className="form-control" />;

const SelectionsContainer = ({ selections, input, multiple }) => (
  <div className={classNames('kinetic-typeahead', { multi: multiple })}>
    {selections}
    {input}
  </div>
);

const Selection = ({ selection, remove }) => {
  const input = (
    <input
      className="form-control"
      type="text"
      disabled
      value={selection.get('name')}
    />
  );
  return remove ? (
    <div className="input-group selection">
      {input}
      {remove && (
        <div className="input-group-append">
          <button
            className="btn btn-sm btn-danger pull-right"
            onClick={remove}
            type="button"
          >
            <i className="fa fa-fw fa-times" />
          </button>
        </div>
      )}
    </div>
  ) : (
    input
  );
};

const SingleSelection = ({ selection, disabled, edit, focusRef, remove }) => (
  <div
    className="selection single form-control-plaintext"
    onClick={edit}
    onKeyDown={edit}
    role="button"
    ref={focusRef}
    tabIndex={0}
  >
    {selection ? selection.get('name') : <em>None</em>}
    {selection &&
      !disabled && (
        <button
          className="btn btn-subtle btn-xs"
          onClick={remove}
          type="button"
        >
          <i className="fa fa-fw fa-times" />
        </button>
      )}
  </div>
);

const SuggestionsContainer = ({ open, children, containerProps }) => (
  <div {...containerProps} className={classNames('suggestions', { open })}>
    {children}
  </div>
);

const Suggestion = ({ suggestion, active }) => {
  const [parent, local] = splitTeamName(suggestion);
  return (
    <div className={classNames('suggestion', { active })}>
      {parent && <div className="small">{parent}</div>}
      <div className="large">{local}</div>
    </div>
  );
};

const components = {
  Input,
  SelectionsContainer,
  Selection,
  Status,
  SuggestionsContainer,
  Suggestion,
};

const singleComponents = {
  ...components,
  Selection: SingleSelection,
};

export const TeamField = props => (
  <FieldWrapper {...props}>
    <TeamSelect
      components={singleComponents}
      id={props.id}
      value={props.value}
      onChange={props.onChange}
      onBlur={props.onBlur}
      onFocus={props.onFocus}
      placeholder={props.placeholder}
    />
  </FieldWrapper>
);

export const TeamMultiField = props => (
  <FieldWrapper {...props}>
    <TeamSelect
      components={components}
      multiple
      id={props.id}
      value={props.value}
      onChange={props.onChange}
      onBlur={props.onBlur}
      onFocus={props.onFocus}
      placeholder={props.placeholder}
    />
  </FieldWrapper>
);
