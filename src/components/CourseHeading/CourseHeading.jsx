// import React from "react";
import { Box, Link, Text, useTheme } from "@chakra-ui/react";
import PropTypes from "prop-types"; // Import PropTypes

const CourseHeading = ({ courses, notes, status, message, productTitle }) => {
  const theme = useTheme();

  return (
    <Box>
      <Text sx={theme.fonts.secondary} fontSize="24px">
        {status === "existing_user" ? (
          <Text display="flex" gap="5px">
            {message ? <div>{message}</div> : notes?.existing_user}
          </Text>
        ) : status === "new_user" ? (
          <Text>{notes?.form}</Text>
        ) : (
          <Text>{notes?.new_user}</Text>
        )}
      </Text>

      <Box mt="37px" width="fit-content">
        {status === "new_user" ? (
          <>
            <Link href={productTitle.link} target="blank">
              <Text fontWeight="400" color={theme.colors.primary}>
                {productTitle.title}:
              </Text>
            </Link>

            <Box mt="15px" ml="10px">
              {courses &&
                Object.keys(courses)?.map((course) => (
                  <Text key={course} sx={theme.fonts.primary}>
                    {courses[course]?.name} ({courses[course]?.description})
                  </Text>
                ))}
            </Box>
          </>
        ) : (
          <Box mt="15px" ml="10px">
            {courses &&
              Object.keys(courses)?.map((course) => (
                <Link
                  target="_blank"
                  key={course}
                  href={courses[course]?.course_link}
                >
                  <Text sx={theme.fonts.primary}>
                    {courses[course]?.name} ({courses[course]?.description})
                  </Text>
                </Link>
              ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

CourseHeading.propTypes = {
  courses: PropTypes.object, // You can define a more specific PropTypes shape here if needed
  notes: PropTypes.object,
  status: PropTypes.string,
  message: PropTypes.string,
  productTitle: PropTypes.object,
};

export default CourseHeading;
