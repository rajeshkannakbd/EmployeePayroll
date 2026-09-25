package com.example.demo.util;

import java.time.DayOfWeek;
import java.time.YearMonth;

public final class WorkingDaysCalculator {

    private WorkingDaysCalculator() {
    }

    public static int calculate(String payPeriod) {

        YearMonth yearMonth = YearMonth.parse(payPeriod);

        int workingDays = 0;

        for (int day = 1;
             day <= yearMonth.lengthOfMonth();
             day++) {

            DayOfWeek dayOfWeek =
                    yearMonth.atDay(day).getDayOfWeek();

            if (dayOfWeek != DayOfWeek.SUNDAY) {
                workingDays++;
            }
        }

        return workingDays;
    }
}