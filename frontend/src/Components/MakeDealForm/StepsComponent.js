import { Grid, GridItem, Box, VStack, Heading, Text, Container, Flex, SimpleGrid } from '@chakra-ui/react';

const steps = [
    { label: "STEP 1", description: "Deal Name" },
    { label: "STEP 2", description: "Investment Constraints" },
    { label: "STEP 3", description: "Project Details" },
    { label: "STEP 4", description: "Fees" },
    { label: "STEP 5", description: "Review & Submit" },
]

function StepsComponent(props) {
    return (
        <Grid templateColumns='repeat(5, 1fr)' gap={6} px={10}>
            {steps.map(({ label, description }, index) => (
                <GridItem w='100%' h='10' key={index}>
                    <Box w='100%' h='1' bg={props.activeStep > index ? '#7879F1' : '#E2E8F0'}/>
                    <VStack spacing={0} alignItems="flex-start">
                        <Text pt={2} color={props.activeStep > index ? '#7879F1' : '#718096'}>{label}</Text>
                        <Text>{description}</Text>
                    </VStack>
                </GridItem>
            ))}
        </Grid>
    )
}

export default StepsComponent;
