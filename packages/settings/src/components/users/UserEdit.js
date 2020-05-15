import React, { Fragment } from 'react';
import { UserForm as UserFormLib, I18n, fetchUser } from '@kineticdata/react';
import { FormComponents, ProfileCard } from 'common';
import { PageTitle } from '../shared/PageTitle';
import { Link } from '@reach/router';
import { getIn } from 'immutable';

const buildProfile = profile => ({
  ...profile,
  displayName: profile.displayName || '',
  email: profile.email || '',
  preferredLocale: profile.preferredLocale || '',
  timezone: profile.timezone || '',
  profileAttributes: profile.profileAttributes || [],
});

const layout = ({ fields, error, buttons }) => (
  <form>
    <div className="row">
      <div className="col-12">
        <h5>General</h5>
        {fields.get('spaceAdmin')}
        {fields.get('enabled')}
        {fields.get('displayName')}
        {fields.get('email')}
      </div>
    </div>
    <hr />
    <div className="row">
      <div className="col-12">{fields.get('profileAttributesMap')}</div>
    </div>
    <hr />
    <div className="row">
      <div className="col-12">{fields.get('attributesMap')}</div>
    </div>
    <hr />
    <div className="row">
      <div className="col-12">
        <h5>Membership</h5>
        {fields.get('memberships')}
      </div>
    </div>
    {error}
    <hr />
    <div className="row">
      <div className="col-12 form-buttons ">{buttons}</div>
    </div>
  </form>
);

export const UserEdit = ({ formKey, username, onSave, onDelete }) => (
  <div className="page-container page-container--panels">
    <PageTitle parts={[`Edit User`, 'Users']} />
    <UserFormLib
      formkey={`user-edit`}
      username={username ? username : null}
      components={{
        FormError: FormComponents.FormError,
        FormButtons: FormComponents.generateFormButtons({
          handleDelete: onDelete,
          submitLabel: 'Update User',
          cancelPath: '/settings/users',
        }),
        FormLayout: layout,
      }}
      addDataSources={
        username
          ? {
              user: {
                fn: fetchUser,
                params: [{ username: username }],
                // Set to the user, or the result in case of an error
                transform: result => result.user || result,
              },
            }
          : undefined
      }
      onSave={onSave}
    >
      {({ form, bindings: { form: formBindings }, initialized, user }) =>
        initialized && (
          <Fragment>
            <div className="page-panel page-panel--two-thirds page-panel--white">
              <div className="page-title">
                <div className="page-title__wrapper">
                  <h3>
                    <Link to="/settings">
                      <I18n>settings</I18n>
                    </Link>{' '}
                    /{' '}
                    <Link to="/settings/users">
                      <I18n>users</I18n>
                    </Link>{' '}
                    /
                  </h3>
                  <h1>
                    <I18n>Edit User</I18n>
                  </h1>
                </div>
              </div>
              {form}
            </div>
            <div className="page-panel page-panel--one-thirds page-panel--sidebar">
              <Fragment>
                <br />
                <ProfileCard
                  user={buildProfile(
                    getIn(form, ['props', 'bindings', 'user'], []).toJS(),
                  )}
                />
              </Fragment>
            </div>
          </Fragment>
        )
      }
    </UserFormLib>
  </div>
);