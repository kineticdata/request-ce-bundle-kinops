import React from 'react';
import wallyHappyImage from 'common/src/assets/images/wally-happy.svg';
import wallyMissingImage from 'common/src/assets/images/wally-missing.svg';
import { QueueListItemSmall } from './QueueListItem';
import { TOO_MANY_STATUS_STRING } from '../../redux/sagas/queue';
import { Constants, GroupDivider, LoadingMessage } from 'common';
import { FilterMenuToolbar } from './FilterMenuToolbar';
import { FilterMenuMobile } from './FilterMenuMobile';
import { QueueListPagination } from './QueueListPagination';
import { PageTitle } from '../shared/PageTitle';

import moment from 'moment';
import { I18n, Moment } from '@kineticdata/react';

const WallyEmptyMessage = ({ filter }) => {
  if (filter.type === 'adhoc') {
    return (
      <div className="empty-state empty-state--wally">
        <div className="empty-state__title">
          <I18n>No Results</I18n>
        </div>
        <img src={wallyMissingImage} alt="Missing Wally" />
        <div className="empty-state__message">
          <I18n>Try a less specific filter.</I18n>
        </div>
        <h5>
          <I18n>Try again</I18n>
        </h5>
      </div>
    );
  }

  return (
    <div className="empty-state empty-state--wally">
      <div className="empty-state__title">
        <I18n>No Assignments</I18n>
      </div>
      <img src={wallyHappyImage} alt="Happy Wally" />
      <div className="empty-state__message">
        <I18n>An empty queue is a happy queue.</I18n>
      </div>
    </div>
  );
};

const WallyErrorMessage = ({ message }) => {
  return (
    <div className="empty-state empty-state--wally">
      <div className="empty-state__title">
        <I18n>
          {message === TOO_MANY_STATUS_STRING ? 'Too Many Items' : 'Error'}
        </I18n>
      </div>
      <img src={wallyMissingImage} alt="Missing Wally" />
      <div className="empty-state__message">
        <I18n>{message}</I18n>
      </div>
      <div className="empty-state__message">
        <I18n>Try again</I18n>
      </div>
    </div>
  );
};

const WallyBadFilter = ({ message }) => (
  <div className="empty-state empty-state--wally">
    <div className="empty-state__title">
      <I18n>Invalid List</I18n>
    </div>
    <img src={wallyMissingImage} alt="Missing Wally" />
    <div className="empty-state__message">
      <I18n>
        {message ||
          'Invalid list, please choose a valid list from the left side.'}
      </I18n>
    </div>
  </div>
);

const GroupByValue = ({ value }) => {
  if (!value) {
    return '';
  } else if (value.match(Constants.DATE_TIME_REGEX)) {
    return (
      <Moment
        timestamp={moment(value)}
        format={Constants.MOMENT_FORMATS.dateTimeNumeric}
      />
    );
  } else if (value.match(Constants.DATE_REGEX)) {
    return (
      <Moment
        timestamp={moment(value, 'YYYY-MM-DD')}
        format={Constants.MOMENT_FORMATS.dateNumeric}
      />
    );
  } else if (value.match(Constants.TIME_REGEX)) {
    return (
      <Moment
        timestamp={moment(value, 'HH:mm')}
        format={Constants.MOMENT_FORMATS.time}
      />
    );
  } else {
    return value;
  }
};

export const QueueList = ({
  filter,
  queueItems,
  statusMessage,
  isLoading,
  openFilterMenu,
  sortDirection,
  sortBy,
  toggleSortDirection,
  groupDirection,
  toggleGroupDirection,
  refresh,
  hasPrevPage,
  hasNextPage,
  gotoPrevPage,
  gotoNextPage,
  count,
  pageCount,
  limit,
  offset,
  isGrouped,
  isMobile,
  filterValidations,
  setQueueListRef,
  hasTeams,
}) => {
  const paginationProps = {
    hasPrevPage,
    hasNextPage,
    gotoPrevPage,
    gotoNextPage,
    count,
    pageCount,
    limit,
    offset,
  };
  return (
    <div className="page-container">
      {!filter ? (
        <div className="page-panel page-panel--no-padding">
          <PageTitle parts={['Invalid List']} />
          <WallyBadFilter />
        </div>
      ) : (
        <div className="page-panel page-panel--no-padding page-panel--white page-panel--flex">
          <PageTitle parts={[filter.name || 'Adhoc']} />
          <div className="page-panel__header">
            {isMobile ? (
              <FilterMenuMobile
                filter={filter}
                openFilterMenu={openFilterMenu}
                refresh={refresh}
                sortDirection={sortDirection}
                toggleSortDirection={toggleSortDirection}
                groupDirection={groupDirection}
                toggleGroupDirection={toggleGroupDirection}
                hasTeams={hasTeams}
              />
            ) : (
              <FilterMenuToolbar filter={filter} refresh={refresh} />
            )}
          </div>
          <div className="page-panel__body">
            {filterValidations.length <= 0 ? (
              <div
                className="queue-list-content submissions"
                ref={setQueueListRef}
              >
                {statusMessage ? (
                  <WallyErrorMessage message={statusMessage} />
                ) : isLoading ? (
                  <LoadingMessage />
                ) : queueItems && queueItems.size > 0 ? (
                  isGrouped ? (
                    queueItems
                      .map((items, groupValue) => (
                        <div
                          className="items-grouping"
                          key={groupValue || 'no-group'}
                        >
                          <GroupDivider>
                            <GroupByValue value={groupValue} />
                          </GroupDivider>
                          <ul className="list-group">
                            {items.map(item => (
                              <QueueListItemSmall
                                queueItem={item}
                                key={item.id}
                                filter={filter}
                              />
                            ))}
                          </ul>
                        </div>
                      ))
                      .toList()
                  ) : (
                    <ul className="list-group">
                      {' '}
                      {queueItems.map(queueItem => (
                        <QueueListItemSmall
                          queueItem={queueItem}
                          key={queueItem.id}
                          filter={filter}
                        />
                      ))}
                    </ul>
                  )
                ) : (
                  <WallyEmptyMessage filter={filter} />
                )}
              </div>
            ) : (
              <WallyBadFilter
                message={filterValidations.map((v, i) => <p key={i}>{v}</p>)}
              />
            )}
          </div>
          <div className="page-panel__footer">
            <QueueListPagination
              filter={filter}
              paginationProps={paginationProps}
            />
          </div>
        </div>
      )}
    </div>
  );
};
