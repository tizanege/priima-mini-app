import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  useTheme,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useAddUser } from "../../hooks/useUsers";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import decodeToken from "../utilites";

/**
 * Returns the correct state key for a field.
 *
 * Basic fields are stored in the plugin as a keyed object:
 *   { basic: { first_name: {...}, last_name: {...} } }
 * So `arrayIndex` IS the real field ID (e.g., "first_name").
 *
 * Additional/custom fields are stored as a numerically-indexed array:
 *   { additional: [ { id: "abc", name: "...", visibility: "on" }, ... ] }
 * So the real field ID is inside `field.id`, not the array index.
 *
 * We must always use the real field ID as the key so that the PHP backend
 * can match the submitted value to the correct field definition.
 */
function getFieldId(fieldGroupKey, arrayIndex, field) {
  if (fieldGroupKey === "additional" && field?.id) {
    return String(field.id);
  }
  return String(arrayIndex);
}

/**
 * Normalize a userDetails group into an iterable array of { id, field } pairs.
 * This unifies the keyed (basic) and indexed (additional) structures.
 */
function getFieldEntries(fieldGroupKey, fieldGroup) {
  if (!fieldGroup || typeof fieldGroup !== "object") return [];

  return Object.entries(fieldGroup).map(([arrayIndex, field]) => ({
    id: getFieldId(fieldGroupKey, arrayIndex, field),
    field,
  }));
}

const UserForm = ({
  userDetails,
  isLoading,
  setSuccessMessage,
  infoText,
  formSubmitText,
  notes,
}) => {
  /**
   * Build initial state using the real field IDs as keys.
   * fields_data shape: { basic: { first_name: "", last_name: "" }, additional: { "abc": "", "xyz": "" } }
   */
  const buildInitialState = (details) => {
    const initialFields = { fields_data: {} };
    if (!details) return initialFields;

    Object.keys(details).forEach((fieldGroupKey) => {
      initialFields.fields_data[fieldGroupKey] = {};
      getFieldEntries(fieldGroupKey, details[fieldGroupKey]).forEach(({ id, field }) => {
        initialFields.fields_data[fieldGroupKey][id] = field?.value || "";
      });
    });

    return initialFields;
  };

  const [formFields, setFormFields] = useState(() => buildInitialState(userDetails));
  const [errorMessage, setErrorMessage] = useState("");
  const { mutate: addUser, isLoading: mutateLoading } = useAddUser();

  // Sync formFields when userDetails changes (e.g. after a background data refetch).
  // Only add fields that are not yet in state — never overwrite user-typed values.
  useEffect(() => {
    if (!userDetails) return;

    setFormFields((prev) => {
      let hasChanges = false;
      const nextFieldsData = { ...prev.fields_data };

      Object.keys(userDetails).forEach((fieldGroupKey) => {
        nextFieldsData[fieldGroupKey] = { ...(nextFieldsData[fieldGroupKey] || {}) };

        getFieldEntries(fieldGroupKey, userDetails[fieldGroupKey]).forEach(({ id, field }) => {
          if (nextFieldsData[fieldGroupKey][id] === undefined) {
            nextFieldsData[fieldGroupKey][id] = field?.value || "";
            hasChanges = true;
          }
        });
      });

      if (!hasChanges) return prev;
      return { ...prev, fields_data: nextFieldsData };
    });
  }, [userDetails]);

  const theme = useTheme();
  const [, setIsFormSubmitted] = useState(false);
  const [emptyFields, setEmptyFields] = useState([]);

  const submitHandler = (e) => {
    e.preventDefault();
    setErrorMessage("");
    const { email } = decodeToken();

    // Validate: collect IDs of required fields that are empty.
    const emptyFieldsList = Object.keys(userDetails).reduce((acc, fieldGroupKey) => {
      const entries = getFieldEntries(fieldGroupKey, userDetails[fieldGroupKey]);
      const missing = entries
        .filter(({ id, field }) => {
          // Skip email (auto-filled) and optional/hidden fields
          if (id === "email") return false;
          if (field?.visibility === "off" || field?.visibility === "optional") return false;
          if (field?.visibility !== "on") return false;

          const val = formFields.fields_data?.[fieldGroupKey]?.[id];
          return val === undefined || val === null || String(val).trim() === "";
        })
        .map(({ id }) => id);

      return [...acc, ...missing];
    }, []);

    if (emptyFieldsList.length === 0) {
      addUser(
        {
          ...formFields,
          fields_data: {
            ...formFields.fields_data,
            basic: {
              ...formFields.fields_data?.basic,
              email,
            },
          },
        },
        {
          onSuccess: (data) => {
            if (data?.status === "error" || data?.status === "fail") {
              setErrorMessage(data?.message || "Failed to register user.");
              setSuccessMessage("");
              setIsFormSubmitted(false);
            } else {
              setSuccessMessage(notes.new_user);
              setErrorMessage("");
              setIsFormSubmitted(true);
              setEmptyFields([]);
            }
          },
          onError: (err) => {
            setErrorMessage(err?.message || "An unexpected error occurred during submission.");
            setSuccessMessage("");
            setIsFormSubmitted(false);
          },
        }
      );
    } else {
      setIsFormSubmitted(false);
      setEmptyFields(emptyFieldsList);
      setErrorMessage("Please fill in all required fields.");
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
          {errorMessage && (
            <Alert status="error" borderRadius="5px" mb="6" maxWidth="100%">
              <AlertIcon />
              <Box flex="1">{errorMessage}</Box>
            </Alert>
          )}
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
              {Object.keys(userDetails).map((fieldGroupKey) =>
                getFieldEntries(fieldGroupKey, userDetails[fieldGroupKey])
                  .filter(({ field }) => field?.visibility !== "off")
                  .map(({ id, field }) => (
                    <FormControl key={`${fieldGroupKey}-${id}`}>
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
                          value={formFields.fields_data?.[fieldGroupKey]?.[id] ?? ""}
                          borderRadius="5px"
                          disabled={id === "email"}
                          sx={{
                            "&::placeholder": {
                              fontSize: "13px",
                            },
                            "&:disabled": {
                              cursor: "pointer",
                            },
                          }}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormFields((prev) => ({
                              ...prev,
                              fields_data: {
                                ...prev.fields_data,
                                [fieldGroupKey]: {
                                  ...(prev.fields_data?.[fieldGroupKey] || {}),
                                  [id]: value,
                                },
                              },
                            }));

                            // Update empty-fields indicator
                            if (value.trim() === "") {
                              setEmptyFields((prev) =>
                                prev.includes(id) ? prev : [...prev, id]
                              );
                            } else {
                              setEmptyFields((prev) => prev.filter((k) => k !== id));
                            }
                          }}
                        />
                      </>
                      {emptyFields.includes(id) && (
                        <Text color="red" fontSize="12px">
                          This field is required.
                        </Text>
                      )}
                    </FormControl>
                  ))
              )}
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
  userDetails: PropTypes.object,
  isLoading: PropTypes.bool,
  setSuccessMessage: PropTypes.func,
  infoText: PropTypes.string,
  formSubmitText: PropTypes.string,
  notes: PropTypes.object,
};

export default UserForm;
