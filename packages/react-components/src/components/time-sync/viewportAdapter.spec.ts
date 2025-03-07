import {
  dateRangeToViewport,
  viewportToDateRange,
  relativeOptions,
  getViewportDateRelativeToAbsolute,
} from './viewportAdapter';

describe('dateRangeToViewport', () => {
  it('can convert a relative date range option to the correct viewport', () => {
    expect(dateRangeToViewport(relativeOptions[0])).toEqual({ duration: '1 minute' });

    expect(dateRangeToViewport(relativeOptions[1])).toEqual({ duration: '5 minute' });

    expect(dateRangeToViewport(relativeOptions[2])).toEqual({ duration: '10 minute' });

    expect(dateRangeToViewport(relativeOptions[3])).toEqual({ duration: '30 minute' });

    expect(dateRangeToViewport(relativeOptions[4])).toEqual({ duration: '1 hour' });

    expect(dateRangeToViewport(relativeOptions[5])).toEqual({ duration: '1 day' });

    expect(dateRangeToViewport(relativeOptions[6])).toEqual({ duration: '7 day' });

    expect(dateRangeToViewport(relativeOptions[7])).toEqual({ duration: '30 day' });

    expect(dateRangeToViewport(relativeOptions[8])).toEqual({ duration: '90 day' });
  });

  it('can convert a relative custom date range option to the correct viewport', () => {
    expect(
      dateRangeToViewport({
        amount: 20,
        unit: 'minute',
        type: 'relative',
      })
    ).toEqual({ duration: '20 minute' });

    expect(
      dateRangeToViewport({
        amount: 3,
        unit: 'month',
        type: 'relative',
      })
    ).toEqual({ duration: '3 month' });
  });

  it('can convert an absolute date range to the correct viewport', () => {
    expect(
      dateRangeToViewport({
        startDate: '2023-01-11T00:00:00Z',
        endDate: '2023-01-13T23:59:59Z',
        type: 'absolute',
      })
    ).toEqual({
      start: new Date('2023-01-11T00:00:00Z'),
      end: new Date('2023-01-13T23:59:59Z'),
    });

    expect(
      dateRangeToViewport({
        startDate: '2023-01-01T00:00:00Z',
        endDate: '2023-02-28T23:59:59Z',
        type: 'absolute',
      })
    ).toEqual({
      start: new Date('2023-01-01T00:00:00Z'),
      end: new Date('2023-02-28T23:59:59Z'),
    });
  });
});

describe('viewportToDateRange', () => {
  it('can convert a relative duration to a date range', () => {
    expect(viewportToDateRange({ duration: '1 minute' })).toEqual(relativeOptions[0]);

    expect(viewportToDateRange({ duration: '1m' })).toEqual(relativeOptions[0]);

    expect(viewportToDateRange({ duration: '5 minute' })).toEqual(relativeOptions[1]);

    expect(viewportToDateRange({ duration: '5m' })).toEqual(relativeOptions[1]);

    expect(viewportToDateRange({ duration: '10 minute' })).toEqual(relativeOptions[2]);

    expect(viewportToDateRange({ duration: '10m' })).toEqual(relativeOptions[2]);

    expect(viewportToDateRange({ duration: '1m 60s' })).toEqual({
      amount: 120,
      unit: 'second',
      type: 'relative',
    });

    expect(viewportToDateRange({ duration: 6000 })).toEqual({
      amount: 6,
      unit: 'second',
      type: 'relative',
    });
  });

  it('can convert an absolute duration to a date range', () => {
    expect(
      viewportToDateRange({
        start: new Date('2023-01-11T00:00:00Z'),
        end: new Date('2023-01-13T23:59:59Z'),
      })
    ).toEqual({
      startDate: '2023-01-11T00:00:00.000Z',
      endDate: '2023-01-13T23:59:59.000Z',
      type: 'absolute',
    });

    expect(
      viewportToDateRange({
        start: new Date('2023-01-01T00:00:00Z'),
        end: new Date('2023-02-28T23:59:59Z'),
      })
    ).toEqual({
      startDate: '2023-01-01T00:00:00.000Z',
      endDate: '2023-02-28T23:59:59.000Z',
      type: 'absolute',
    });

    expect(
      viewportToDateRange({
        start: new Date('2023-01-11T00:00:00Z'),
        end: new Date('2023-01-13T23:59:59.00Z'),
      })
    ).toEqual({
      startDate: '2023-01-11T00:00:00.000Z',
      endDate: '2023-01-13T23:59:59.000Z',
      type: 'absolute',
    });

    expect(
      viewportToDateRange({
        start: new Date('2023-01-01T00:00:00Z'),
        end: new Date('2023-02-28T23:59:59.00Z'),
      })
    ).toEqual({
      startDate: '2023-01-01T00:00:00.000Z',
      endDate: '2023-02-28T23:59:59.000Z',
      type: 'absolute',
    });
  });
});

describe('getViewportStartOnBackwardRelative', () => {
  jest.useFakeTimers().setSystemTime(new Date(2023, 11, 24).getTime());

  it('can get the new start date when going back from a relative duration', () => {
    let currentDate = new Date();
    let newDate = getViewportDateRelativeToAbsolute({
      amount: 5,
      unit: 'minute',
      type: 'relative',
    });

    const result = currentDate.getTime() - newDate.getTime();
    expect(result).toEqual(300000);

    currentDate = new Date();
    newDate = getViewportDateRelativeToAbsolute({
      amount: 1,
      unit: 'hour',
      type: 'relative',
    });

    expect(currentDate.getTime() - newDate.getTime()).toEqual(3600000);

    currentDate = new Date();
    newDate = getViewportDateRelativeToAbsolute({
      amount: 30,
      unit: 'second',
      type: 'relative',
    });
    expect(currentDate.getTime() - newDate.getTime()).toEqual(30000);

    currentDate = new Date();
    newDate = getViewportDateRelativeToAbsolute({
      amount: 1,
      unit: 'day',
      type: 'relative',
    });
    expect(currentDate.getTime() - newDate.getTime()).toEqual(86400000);

    currentDate = new Date();
    newDate = getViewportDateRelativeToAbsolute({
      amount: 1,
      unit: 'week',
      type: 'relative',
    });
    expect(currentDate.getTime() - newDate.getTime()).toEqual(604800000);

    currentDate = new Date();
    newDate = getViewportDateRelativeToAbsolute({
      amount: 1,
      unit: 'month',
      type: 'relative',
    });
    expect(currentDate.getTime() - newDate.getTime()).toEqual(2592000000); //previous month is 30 days

    jest.useRealTimers();
  });
});

describe('getViewportStartOnBackwardRelative on first backward click', () => {
  jest.useFakeTimers().setSystemTime(new Date(2023, 11, 24).getTime());

  it('can get the new start date from current range when going back from a relative duration', () => {
    let currentDate = new Date();
    let newDate = getViewportDateRelativeToAbsolute(
      {
        amount: 5,
        unit: 'minute',
        type: 'relative',
      },
      true
    );

    const result = currentDate.getTime() - newDate.getTime();
    expect(result).toEqual(600000);

    currentDate = new Date();
    newDate = getViewportDateRelativeToAbsolute(
      {
        amount: 1,
        unit: 'hour',
        type: 'relative',
      },
      true
    );

    expect(currentDate.getTime() - newDate.getTime()).toEqual(7200000);

    currentDate = new Date();
    newDate = getViewportDateRelativeToAbsolute(
      {
        amount: 30,
        unit: 'second',
        type: 'relative',
      },
      true
    );
    expect(currentDate.getTime() - newDate.getTime()).toEqual(60000);

    currentDate = new Date();
    newDate = getViewportDateRelativeToAbsolute(
      {
        amount: 1,
        unit: 'day',
        type: 'relative',
      },
      true
    );
    expect(currentDate.getTime() - newDate.getTime()).toEqual(172800000);

    currentDate = new Date();
    newDate = getViewportDateRelativeToAbsolute(
      {
        amount: 1,
        unit: 'week',
        type: 'relative',
      },
      true
    );
    expect(currentDate.getTime() - newDate.getTime()).toEqual(1209600000);

    currentDate = new Date();
    newDate = getViewportDateRelativeToAbsolute(
      {
        amount: 1,
        unit: 'month',
        type: 'relative',
      },
      true
    );

    const previousMonthDays = new Date(newDate.getFullYear(), newDate.getMonth() - 1, 0).getDate(); //calculating no of days for previous month of current range
    const timeGap = previousMonthDays === 30 ? 5184000000 : 5270400000;
    expect(currentDate.getTime() - newDate.getTime()).toEqual(timeGap);

    jest.useRealTimers();
  });
});
