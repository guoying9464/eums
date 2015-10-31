from eums.models import Programme

programme_1 = Programme.objects.create(wbs_element_ex="A00", name="sample programme")
programme_2 = Programme.objects.create(wbs_element_ex="A01", name="YI105 - PCR 1 KEEP CHILDREN AND MOTHERS")
programme_3 = Programme.objects.create(wbs_element_ex="A02", name="YI107 - PCR 3 KEEP CHILDREN SAFE")
programme_4 = Programme.objects.create(wbs_element_ex="A03", name="YI105 - PCR 1 KEEP CHILDREN AND MOTHERS")
programme_5 = Programme.objects.create(wbs_element_ex="A04", name="Y108 - PCR 4 CROSS SECTORAL")
programme_6 = Programme.objects.create(wbs_element_ex="A05", name="YP109 - PCR 5 SUPPORT")
programme_9 = Programme.objects.create(wbs_element_ex="A06", name="YI106 - PCR 2 KEEP CHILDREN LEARNING")
programme_10 = Programme.objects.create(wbs_element_ex="A07", name="YI101 KEEP CHILDREN AND MOTHERS ALIVE")
programme_11 = Programme.objects.create(wbs_element_ex="A08", name="YP104 MANAGEMENT RESULTS")
programme_12 = Programme.objects.create(wbs_element_ex="A09", name="YI102 KEEP CHILDREN LEARNING")
programme_13 = Programme.objects.create(wbs_element_ex="A10", name="YI103 KEEP CHILDREN SAFE")
programme_14 = Programme.objects.create(wbs_element_ex="A11", name="* YP109 - PCR 5 Support - Effective & efficient programme ma")
programme_15 = Programme.objects.create(wbs_element_ex="A12", name="* 040623/YW402-YW402 Water, Sanitation and")
programme_16 = Programme.objects.create(wbs_element_ex="A13", name="* 040623/YP602-YP602 Cross-Sectoral Costs")
programme_17 = Programme.objects.create(wbs_element_ex="4380/A0/04/105/005", name="")
programme_18 = Programme.objects.create(wbs_element_ex="4380/A0/04/108/003", name="PCR: 123 - Test Outcome 1")

programme_unattached = Programme.objects.create(wbs_element_ex="A99", name="unattached programme")
