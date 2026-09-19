package com.example.demo.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class NumberToWords {

    private static final String[] ONES = {
            "", "One", "Two", "Three", "Four",
            "Five", "Six", "Seven", "Eight", "Nine",
            "Ten", "Eleven", "Twelve", "Thirteen",
            "Fourteen", "Fifteen", "Sixteen", "Seventeen",
            "Eighteen", "Nineteen"
    };

    private static final String[] TENS = {
            "", "", "Twenty", "Thirty", "Forty",
            "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    };

    public static String convert(BigDecimal amount) {

        amount = amount.setScale(2, RoundingMode.HALF_UP);

        long rupees = amount.longValue();

        int paise = amount
                .remainder(BigDecimal.ONE)
                .movePointRight(2)
                .intValue();

        String result = convertNumber(rupees) + " Rupees";

        if (paise > 0) {
            result += " and "
                    + convertNumber(paise)
                    + " Paise";
        }

        return result + " Only";
    }

    private static String convertNumber(long number) {

        if (number < 20) {
            return ONES[(int) number];
        }

        if (number < 100) {
            return TENS[(int) (number / 10)]
                    + (number % 10 != 0
                    ? " " + ONES[(int) (number % 10)]
                    : "");
        }

        if (number < 1000) {
            return ONES[(int) (number / 100)]
                    + " Hundred"
                    + (number % 100 != 0
                    ? " " + convertNumber(number % 100)
                    : "");
        }

        if (number < 100000) {
            return convertNumber(number / 1000)
                    + " Thousand"
                    + (number % 1000 != 0
                    ? " " + convertNumber(number % 1000)
                    : "");
        }

        if (number < 10000000) {
            return convertNumber(number / 100000)
                    + " Lakh"
                    + (number % 100000 != 0
                    ? " " + convertNumber(number % 100000)
                    : "");
        }

        return convertNumber(number / 10000000)
                + " Crore"
                + (number % 10000000 != 0
                ? " " + convertNumber(number % 10000000)
                : "");
    }
}