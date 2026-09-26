package com.example.demo.util;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public final class WorkingDaysCalculator {

    private WorkingDaysCalculator() {
    }

    public static int calculate(
            String payPeriod,
            List<String> holidayDates
    ) {

        YearMonth yearMonth = YearMonth.parse(payPeriod);

        Set<String> holidays =
                holidayDates == null
                        ? Set.of()
                        : new HashSet<>(holidayDates);

        int workingDays = 0;

        for (int day = 1;
             day <= yearMonth.lengthOfMonth();
             day++) {

            LocalDate date =
                    yearMonth.atDay(day);

            String dateStr =
                    date.toString();

            if (date.getDayOfWeek() != DayOfWeek.SUNDAY
                    && !holidays.contains(dateStr)) {

                workingDays++;
            }
        }

        return workingDays;
    }
}