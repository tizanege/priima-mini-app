import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  useTheme,
} from "@chakra-ui/react";
import { useAddUser } from "../../hooks/useUsers";
import PropTypes from "prop-types"; // Import PropTypes
import { useEffect, useState } from "react";
import decodeToken from "../utilites";

const UserForm = ({
  userDetails,
  isLoading,
  setSuccessMessage,
  infoText,
  formSubmitText,
  notes,
}) => {
  const [formFields, setFormFields] = useState(() => {
    const initialFields = { fields_data: {} };
    if (userDetails) {
      Object.keys(userDetails).forEach((fieldKey) => {
        initialFields.fields_data[fieldKey] = {};
        Object.keys(userDetails[fieldKey]).forEach((key) => {
          initialFields.fields_data[fieldKey][key] = userDetails[fieldKey][key].value || "";
        });
      });
    }
    return initialFields;
  });

  // Sync formFields if userDetails changes (e.g. from a background data refetch)
  useEffect(() => {
    if (userDetails) {
      setFormFields((prev) => {
        const updatedFields = { ...prev };
        updatedFields.fields_data = updatedFields.fields_data || {};
        
        let hasChanges = false;
        Object.keys(userDetails).forEach((fieldKey) => {
          if (!updatedFields.fields_data[fieldKey]) {
            updatedFields.fields_data[fieldKey] = {};
            hasChanges = true;
          }
          Object.keys(userDetails[fieldKey]).forEach((key) => {
            if (updatedFields.fields_data[fieldKey][key] === undefined) {
              updatedFields.fields_data[fieldKey][key] = userDetails[fieldKey][key].value || "";
              hasChanges = true;
            }
          });
        });
        
        return hasChanges ? updatedFields : prev;
      });
    }
  }, [userDetails]);

  const { mutate: addUser, isLoading: mutateLoading } = useAddUser();

  // const formStyles = {
  //   display: "grid",
  //   gridTemplateColumns: "1fr 1fr",
  //   alignItems: "baseline",
  //   columnGap: "67px",
  //   rowGap: "14px",
  // };

  const theme = useTheme();
  const [, setIsFormSubmitted] = useState(false);
  const [emptyFields, setEmptyFields] = useState([]);

  const submitHandler = (e) => {
    e.preventDefault();

    const { email } = decodeToken();

    const emptyFieldsList = Object.keys(userDetails).reduce((acc, fieldKey) => {
      return [
        ...acc,
        ...Object.keys(userDetails[fieldKey])
          .filter(
            (key) =>
              userDetails[fieldKey][key].visibility !== "off" &&
              key !== "email" &&
              userDetails[fieldKey][key].visibility !== "optional"
          )
          .filter((key) => {
              const val = formFields.fields_data?.[fieldKey]?.[key];
              return val === undefined || val === null || String(val).trim() === "";
            }),
      ];
    }, []);

    if (emptyFieldsList.length === 0) {
      addUser({
        ...formFields,
        fields_data: {
          ...formFields.fields_data,
          basic: {
            ...formFields.fields_data?.basic,
            email,
          },
        },
      });

      setSuccessMessage(notes.new_user);
      setIsFormSubmitted(true);
      setEmptyFields([]);
    } else {
      setIsFormSubmitted(false);
      setEmptyFields(emptyFieldsList);
    }
  };

  return (
    <Box
      mt="59px"
      borderRadius="10px"
      background="#E6F2F3"
      boxShadow="0px 2px 5px 0px rgba(33, 91, 124, 0.15)"
      display="flex"
      padding="52px 0px 90px"
    >
      <Box maxWidth="85%" margin="auto">
        <Box>
          <Text fontSize="20px" sx={theme.fonts.primary}>
            {infoText}
          </Text>
        </Box>
        <Box mt="64px">
          <form>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                alignItems: "baseline",
                columnGap: "67px",
                rowGap: "14px",

                "@media (max-width: 768px)": {
                  display: "flex",
                  flexDirection: "column",
                },
              }}
            >
              {Object.keys(userDetails).map((fieldKey) => (
                <>
                  {Object.keys(userDetails[fieldKey])
                    .filter(
                      (key) => userDetails[fieldKey][key].visibility !== "off"
                    )
                    .map((key) => {
                      const field = userDetails[fieldKey][key];
                      return (
                        <FormControl key={key}>
                          <>
                            <FormLabel
                              fontWeight="500"
                              fontSize="14px"
                              color={theme.colors.primary}
                              display="flex"
                            >
                              {field?.name}:
                              {field?.visibility === "on" && <Text>*</Text>}
                            </FormLabel>

                            <Input
                              background="#fff"
                              maxWidth="100%"
                              width="313px"
                              height="25px"
                              placeholder={field?.name}
                              boxShadow="0px 0px 2px 0px rgba(33, 91, 124, 0.50) inset"
                              size="sm"
                              value={formFields.fields_data?.[fieldKey]?.[key] ?? field?.value ?? ""}
                              borderRadius="5px"
                              disabled={field?.name === "Email"}
                              sx={{
                                "&::placeholder": {
                                  fontSize: "13px",
                                },

                                "&:disabled": {
                                  cursor: "pointer", // Change cursor style for disabled input
                                },
                              }}
                              onChange={(e) => {
                                const value = e.target.value;
                                  setFormFields((prev) => {
                                    const prevFieldsData = prev.fields_data || {};
                                    const prevFieldGroup = prevFieldsData[fieldKey] || {};

                                    const newState = {
                                      ...prev,
                                      fields_data: {
                                        ...prevFieldsData,
                                        [fieldKey]: {
                                          ...prevFieldGroup,
                                          [key]: value
                                        }
                                      }
                                    };

                                    if (value.trim() === "") {
                                    setEmptyFields((prevEmptyFields) =>
                                      prevEmptyFields.includes(key)
                                        ? prevEmptyFields
                                        : [...prevEmptyFields, key]
                                    );
                                  } else {
                                    setEmptyFields((prevEmptyFields) =>
                                      prevEmptyFields.filter(
                                        (emptyKey) => emptyKey !== key
                                      )
                                    );
                                  }

                                  return newState;
                                });
                              }}
                            />
                          </>
                          {emptyFields.includes(key) && (
                            <Text color="red" fontSize="12px">
                              This field is required.
                            </Text>
                          )}
                        </FormControl>
                      );
                    })}
                </>
              ))}
            </Box>
          </form>

          <Button
            mt="86px"
            display="flex"
            width="200px"
            isLoading={mutateLoading || isLoading}
            color="#FFF"
            onClick={submitHandler}
            background={theme.colors.primary}
            sx={{
              "&:hover": {
                background: theme.colors.primary,
              },
            }}
          >
            {formSubmitText}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

UserForm.propTypes = {
  userDetails: PropTypes.object, // You can define a more specific PropTypes shape here if needed
  isLoading: PropTypes.bool,
  setSuccessMessage: PropTypes.func,
  infoText: PropTypes.string,
  formSubmitText: PropTypes.string,
  notes: PropTypes.object,
};

export default UserForm;
